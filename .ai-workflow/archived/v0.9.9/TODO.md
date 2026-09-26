# TODO: v0.9.9 — 노드 텍스트 줄임을 영어와 그 외 언어로 분리

> `PLAN.md`를 바탕으로 한 세부 실행 체크리스트. 완료 시 `[x]` 표시.

## 0. 사전 확인 (코드 작업 착수 전)

- [x] (A) 줄임 방식 확정: 폭 가중치(라틴1/CJK2) 단일 예산 vs 영어/비영어 max 분리 설정
  - 결정: 영어/비영어 max 분리 설정.
- [x] (B) 영어 단어 경계 줄임 적용 여부 확정
  - 결정: 단순 절단.
- [ ] "코드 작업 진행해줘" 지시 수령

## 1. 구현

- [x] `src/main.ts`: `InlineGraphSettings`에 `maxLabelLengthCJK` 추가 + `DEFAULT_SETTINGS` 기본값 10
- [x] `src/InlineGraphView.ts`: 언어 판별 헬퍼 `hasWideChar` 추가 (CJK/전각 포함 여부)
- [x] `src/InlineGraphView.ts:10`: `truncateLabel`을 언어별 max 선택 + 단순 절단 방식으로 재작성
- [x] 호출부(`src/InlineGraphView.ts:151-153` `toLabel`)에서 영어/비영어 max 두 값 전달
- [x] `src/InlineGraphSettingTab.ts`: 비영어용 'Max label length (CJK)' 슬라이더 설정 추가

## 1-B. 구현: 설정/UI 메시지 다국어(i18n)

- [x] `src/i18n.ts` 신설: 로케일 감지(`localStorage 'language'`) + `{en,ko,ja}` 사전 + `t()` (en fallback)
- [x] `src/InlineGraphSettingTab.ts`: 모든 `setName`/`setDesc` 문자열을 `t()`로 교체
- [x] `src/InlineGraphView.ts`: UI 텍스트('Outgoing'/'Incoming'/'No note found.' 등)를 `t()`로 교체
- [x] 한국어/일본어 번역 문구 작성 (설정 항목 라벨·설명 전체)

## 2. 검증

- [x] 영어 긴 문자열 줄임 + `...` 부착 확인 (node 검증)
- [x] 한국어/일본어/중국어 긴 문자열 줄임(시각 폭 유사) 확인 (node 검증)
- [x] 영어+CJK 혼합 문자열 줄임 확인 (CJK 포함 → 비영어 기준, node 검증)
- [x] 짧은 문자열 원문 유지 확인 (node 검증)
- [x] `truncateLabels=false` 시 줄임 미적용 확인 (`toLabel` 분기상 원문 반환)
- [x] 기존 영어 라벨 표시 회귀 없음 확인 (`maxLabelLength` 기본 20 유지)
- [x] 빌드(`main.js`) 산출 (`npm run build` tsc 통과 + esbuild)
- [x] Obsidian 실환경 확인 (사용자 수동 확인 완료)
- [x] i18n: 한국어 설정 시 문자열 한국어 표시 확인 (사용자 확인 완료)
- [x] i18n: 일본어 설정 시 문자열 일본어 표시 확인 (사용자 확인 완료)
- [x] i18n: 그 외 언어 시 영어 fallback 확인 (detectLocale 로직 검증)

## 3. 마무리 (릴리즈)

- [x] `manifest.json` / `package.json` / `versions.json` 버전 0.9.9 반영
- [x] 영문 `CHANGELOG.md` 갱신
- [x] 발생한 이슈/에러 `TROUBLE.md`에 한국어 요약 추가 (`npm version` 자동 태그 주의)
- [x] 본 작업 폴더 `active/v0.9.9/` → `archived/v0.9.9/` 이동
