# PLAN: v0.9.9 — 노드 텍스트 줄임을 영어와 그 외 언어로 분리

> `SPEC.md`(무엇을·왜)를 바탕으로 "어떻게"를 구체화한 문서입니다.

## 1. 현황 및 원인 분석

### 현재 구현

- 줄임 로직은 단 하나의 정적 메서드에 있음:
  - `src/InlineGraphView.ts:10`
    ```ts
    private static truncateLabel(label: string, max: number) {
        return label.length > max ? label.slice(0, max) + '...' : label;
    }
    ```
- 적용 지점: `src/InlineGraphView.ts:151-153`
  ```ts
  const truncate = settings.truncateLabels ?? true;
  const maxLen = settings.maxLabelLength ?? 20;
  const toLabel = (name: string) => truncate ? InlineGraphView.truncateLabel(name, maxLen) : name;
  ```
- 관련 설정:
  - `truncateLabels`(boolean), `maxLabelLength`(number, 기본 20) — `src/main.ts:13-14, 27-28`
  - 설정 UI — `src/InlineGraphSettingTab.ts:142-166`

### 원인

- `label.length`는 모든 문자를 폭 1로 계산한다. 그러나 실제 렌더링 폭은 **라틴(영어) 문자 ≈ 0.5~0.6em**, **CJK(한·중·일) 문자 ≈ 1em** 으로 약 2배 차이가 난다.
- 따라서 동일한 `maxLabelLength=20`을 적용하면:
  - 영어 라벨: 노드가 가로로 너무 길어짐(20자가 꽤 김).
  - CJK 라벨: 영어 대비 약 2배 폭이라 노드가 과도하게 커지거나, 반대로 영어 기준에 맞추면 CJK가 너무 일찍/늦게 잘림.
- 즉 **언어별 시각적 폭 차이가 줄임 기준에 반영되지 않는 것**이 근본 원인이다.

## 2. 설계 및 작업 계획

> 확정된 결정 (`TODO.md` 0번 참조)
> - **(A)** 영어/비영어의 **최대 글자 수(max length)를 각각 별도 설정값으로 분리**한다.
> - **(B)** 줄임은 **단순 절단(simple truncation)** — 단어 경계 처리 없이 한계 글자 수에서 바로 자르고 `...` 부착.

### 설계 방침

라벨의 언어를 판별하여 **영어용 max / 비영어용 max** 중 알맞은 값을 골라 글자 수 기준으로 단순 절단한다.

1. **언어 판별 헬퍼 추가** — `hasWideChar(label)`: 라벨에 CJK/전각 문자가 하나라도 있으면 "비영어"로 간주.
   - 대상 범위(초안): CJK 통합 한자(U+4E00–U+9FFF), 한글(U+AC00–U+D7A3, U+1100–U+11FF), 일본어 가나(U+3040–U+30FF), CJK 기호·전각(U+3000–U+303F, U+FF00–U+FFEF) 등.
   - 판별 정책: **CJK 문자가 하나라도 포함되면 비영어 max 적용, 전부 라틴/협각이면 영어 max 적용.** (혼합 텍스트 = 비영어로 취급 → 더 짧은 기준으로 자름)
2. **설정 분리** — 기존 `maxLabelLength`를 영어용으로 유지하고, 비영어용 설정을 신설한다.
   - `maxLabelLength`(영어/라틴, 기본 20) — 기존 값 그대로 사용(하위 호환).
   - `maxLabelLengthCJK`(비영어/전각, 기본 10) — 신설. CJK가 약 2배 폭이므로 영어의 절반 정도를 기본값으로.
3. **줄임 로직 재작성** — `truncateLabel`이 라벨의 언어에 따라 적용할 max를 고르고, `label.length > max`이면 `label.slice(0, max) + '...'`로 단순 절단.
4. **혼합 텍스트** — CJK 포함 시 비영어 max를 적용(위 판별 정책). 별도 분기 없이 일관 처리.

### 변경 파일

- `src/main.ts`
  - `InlineGraphSettings`에 `maxLabelLengthCJK: number` 추가, `DEFAULT_SETTINGS`에 기본값 `10` 추가.
- `src/InlineGraphView.ts`
  - `hasWideChar` 헬퍼 추가.
  - `truncateLabel`을 언어별 max 선택 + 단순 절단 방식으로 교체. 시그니처는 영어/비영어 max를 모두 받도록 조정(예: `truncateLabel(label, maxEn, maxCjk)`).
  - 호출부(`src/InlineGraphView.ts:151-153` `toLabel`)에서 두 설정값을 넘기도록 수정.
- `src/InlineGraphSettingTab.ts`
  - 기존 'Max label length'(영어) 설정 옆에 비영어용 'Max label length (CJK)' 슬라이더 설정 추가.

### 작업 범위 밖(원칙상 건드리지 않음)

- 노드 레이아웃·폰트·셰이프, 그 외 무관한 설정, 빌드 산출물(`main.js`)은 본 태스크에서 다루지 않음.
  (단, 빌드는 검증 단계에서 산출 필요 시 별도 진행)

## 2-B. 추가 과제: 설정/UI 메시지 다국어(i18n) 지원

> 현재 설정 화면과 그래프 UI의 모든 문자열이 영문 하드코딩 상태다. 우선 **한국어·일본어**를 지원하고, 영어를 기본(fallback)으로 둔다.

### 현황

- 사용자 노출 문자열 위치:
  - `src/InlineGraphSettingTab.ts` — 모든 `setName()`/`setDesc()` (설정 항목 라벨/설명 다수).
  - `src/InlineGraphView.ts` — `'Outgoing'`(:30), `'Incoming'`(:60), `'No note found.'`(:147) 등 UI 텍스트.

### 설계 방침

1. **로케일 감지** — Obsidian UI 언어를 `window.localStorage.getItem('language')`로 읽는다. (`ko`, `ja`, 그 외/미설정 → `en`)
2. **번역 모듈 신설** — `src/i18n.ts`
   - 문자열 키 → `{ en, ko, ja }` 사전(dictionary) 구성.
   - `t(key)` 함수: 현재 로케일 값 반환, 누락 시 `en`으로 fallback.
   - 지원 로케일은 `en`/`ko`/`ja`만. 그 외 언어는 `en` 사용.
3. **문자열 치환** — 위 두 파일의 하드코딩 문자열을 `t('key')` 호출로 교체.
4. **확장성** — 이후 다른 언어 추가는 사전에 로케일 키만 늘리면 되도록 구조화.

### 변경 파일 (i18n)

- `src/i18n.ts` (신설) — 로케일 감지 + 사전 + `t()`.
- `src/InlineGraphSettingTab.ts` — `setName`/`setDesc` 문자열을 `t()`로 교체.
- `src/InlineGraphView.ts` — UI 텍스트('Outgoing'/'Incoming'/'No note found.' 등)를 `t()`로 교체.

### 결정/기본값 (제안)

- 지원 우선순위: **ko, ja 우선 + en fallback.** (요청대로 그 외 언어는 이후 과제)
- 번역 문구 톤: 설정 화면 표준 표현(간결한 명령/설명형)으로 통일.

## 3. 테스트

- **단위 동작 확인** (샘플 라벨로 줄임 결과 검증):
  - 영어 긴 문자열 → 폭 예산에서 잘리고 `...` 부착.
  - 한국어/일본어/중국어 긴 문자열 → 영어 대비 약 절반 글자 수에서 잘림(시각 폭 유사).
  - 영어+CJK 혼합 문자열 → 깨짐 없이 폭 기준으로 잘림.
  - 짧은 문자열 → 원문 그대로(잘림·`...` 없음).
  - `truncateLabels=false` → 줄임 미적용(원문 유지).
- **회귀 확인**: 기존 영어 전용 라벨 표시가 기존과 유사하게 동작(노드 폭 급변 없음).
- **수동 확인**: Obsidian에서 플러그인 로드 후 실제 노드 그래프에서 영어/CJK/혼합 노트 표시 확인.
- **i18n 확인**:
  - Obsidian 언어를 한국어로 설정 시 설정/UI 문자열이 한국어로 표시.
  - 일본어로 설정 시 일본어로 표시.
  - 그 외 언어(예: 영어/미설정) 시 영어로 fallback.

## 4. 롤백

- 변경은 `truncateLabel` 메서드와 헬퍼 추가에 국한되므로, 문제 발생 시 해당 메서드를 기존 `label.length` 기반 구현으로 되돌리면 됨.
