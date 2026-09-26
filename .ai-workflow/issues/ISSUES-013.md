# Issue #13: Limit the maximum number of displayed nodes

> **링크**: https://github.com/TKOxff/obsidian-inline-local-graph/issues/13
> **요청자**: TKOxff | **등록일**: 2026-07-05 | **상태**: Open (대응 예정: v0.9.10)

---

## 요청 내용 요약

그래프에 표시되는 노드 개수의 **최대치를 설정**할 수 있는 옵션 추가.

- 기본값: **30개 정도**.
- 목적: 링크/백링크가 매우 많은 노트에서 그래프가 과밀해지는 것을 방지.

---

## 현재 코드 분석

### 노드 생성 로직 (`src/InlineGraphView.ts`)

- 노드는 **상한 없이** 생성됨:
  - 활성 노트 노드 1개로 시작 (`nodes`, line 173)
  - 아웃고잉 링크 전체를 순회하며 추가 (`if (settings.showLinks) for ...`, line 180~195)
  - 백링크 전체를 순회하며 추가 (`if (settings.showBacklinks) for ...`, line 198~216)
- 중복은 `nodeSet`(Set)으로만 방지, **개수 제한 없음**.
- 엣지(`edges`)는 각 노드 추가 시 함께 생성됨. → 노드를 잘라내면 **대응 엣지도 함께 제거**해야 vis-network에서 dangling edge 오류가 없음.

### 관련 설정 (`src/main.ts`)

- 현재 노드 개수 관련 설정 없음. `showLinks`/`showBacklinks`/`skipImageLinks`로 종류만 필터링.

---

## 대응 전략

### 1. 최대 노드 수 설정 추가

**변경 파일**: `src/main.ts`

- `maxNodes: number` 설정 추가 (기본값: **30**).
- `DEFAULT_SETTINGS`에 기본값 반영, 기존 사용자 하위 호환(`?? 30`).

### 2. 노드 생성 시 상한 적용

**변경 파일**: `src/InlineGraphView.ts`

- 활성 노트 노드는 **항상 포함**(상한에서 제외하지 않음).
- 아웃고잉 → 백링크 순으로 추가하되, `nodeSet.size`가 `maxNodes`에 도달하면 이후 노드 추가 중단.
- **엣지 필터링**: 최종 `nodes`에 포함된 id만 참조하는 엣지만 남긴다. (누락 노드를 가리키는 엣지 제거)
- 우선순위(초안): 아웃고잉 링크를 백링크보다 우선 포함. (표시 순서상 자연스러움 — 세부는 PLAN에서 확정)

### 3. 설정 UI

**변경 파일**: `src/InlineGraphSettingTab.ts`

- 'Max displayed nodes' 슬라이더 추가 (범위 초안: 5~200, 기본 30).
- i18n: `src/i18n.ts`에 en/ko/ja 문자열 추가.

---

## 대응 버전

**v0.9.10**에 포함 예정. 상세 명세는 `.ai-agent/active/v0.9.10/SPEC.md`, 작업 계획은 이후 `PLAN.md`/`TODO.md` 참조.

---

## 이슈 종료 조건

- [ ] `maxNodes` 설정 추가 및 기본값 30 동작
- [ ] 노드 수가 상한을 초과하면 상한까지만 표시
- [ ] 활성 노트 노드는 상한과 무관하게 항상 표시
- [ ] 잘려나간 노드를 참조하는 엣지가 남지 않음 (dangling edge 없음)
- [ ] 설정 슬라이더에서 값 변경 시 그래프 즉시 갱신
- [ ] 기존 설정이 없는 사용자도 기본값으로 정상 동작 (하위 호환)
