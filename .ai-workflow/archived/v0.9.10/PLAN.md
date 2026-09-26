# PLAN: v0.9.10 — 표시 노드 최대 개수 제한 옵션

> `SPEC.md`(무엇을·왜)를 바탕으로 "어떻게"를 구체화한 문서입니다.
> 관련 이슈 분석: `.ai-agent/issues/ISSUES-013.md`

## 1. 현황 및 원인 분석

### 현재 구현 (`src/InlineGraphView.ts`)

- 노드/엣지 생성부(대략 line 171~218):
  - 활성 노트 노드 1개로 시작 (`nodes = [{ id: activeId, ... }]`, line 173).
  - 아웃고잉 링크 전체 순회 → 신규면 `nodes.push`, 매번 `edges.push` (line 180~195).
  - 백링크 전체 순회 → 신규면 `nodes.push`, 매번 `edges.push` (line 198~216).
  - 중복만 `nodeSet`(Set)으로 방지, **개수 상한 없음**.
- `edges`는 노드 존재 여부와 무관하게 순회 중 push된다. → 노드를 상한으로 잘라내면 **그 노드를 가리키는 엣지가 남아 dangling edge**가 된다.

### 원인

- 표시 노드 수에 제한이 없어, 링크·백링크가 많은 노트에서 그래프가 과밀해진다.

## 2. 설계 및 작업 계획

### 설계 방침

활성 노트 노드는 항상 포함하고, 나머지 노드를 **상한(`maxNodes`)까지만** 추가한다. 마지막에 엣지를 정리해 dangling edge를 제거한다.

1. **설정 추가** — `maxNodes: number` (기본 30).
2. **노드 상한 적용** — 아웃고잉 → 백링크 순으로 순회하되, 신규 노드를 추가하기 전에 `nodeSet.size >= maxNodes`이면 추가하지 않는다. (활성 노드는 시작 시 이미 포함되어 상한에 자연 포함)
3. **엣지 정리** — 생성 마지막에 `edges`를 **양끝 노드가 모두 `nodeSet`에 있는 것만** 남기도록 필터링한다. (누락 노드를 가리키는 엣지 제거)
   ```ts
   const finalEdges = edges.filter(e => nodeSet.has(e.from) && nodeSet.has(e.to));
   ```
4. **설정 UI + i18n** — 슬라이더 추가 및 en/ko/ja 문자열 반영.

### 변경 파일

- `src/main.ts`
  - `InlineGraphSettings`에 `maxNodes: number` 추가, `DEFAULT_SETTINGS`에 `30` 추가.
- `src/InlineGraphView.ts`
  - 노드 순회 루프에 상한 가드 추가(신규 노드 추가 전 `nodeSet.size < maxNodes` 확인).
  - `const data = { nodes, edges }` 직전에 엣지 필터링 적용.
  - `settings.maxNodes ?? 30`으로 하위 호환.
- `src/InlineGraphSettingTab.ts`
  - 'Max displayed nodes' 슬라이더 설정 추가(값 변경 시 `saveSettings` + `updateGraphs`).
- `src/i18n.ts`
  - `maxNodesName` / `maxNodesDesc` 키를 en/ko/ja에 추가.

### 결정/기본값 (확정 — `TODO.md` 0번 참조)

- **(A) 상한 도달 시 우선순위**: **아웃고잉 링크 우선**(백링크보다 먼저 포함). 현재 코드 순회 순서와 일치, 직접 참조가 더 관련성 높음.
- **(B) 슬라이더 범위**: **5 ~ 200, step 1, 기본 30.**

## 3. 테스트

- **동작 확인**:
  - 노드 총수 > `maxNodes` → 상한 개수까지만 표시.
  - 활성 노트 노드는 상한과 무관하게 항상 표시.
  - 잘려나간 노드를 가리키는 엣지 없음(dangling edge 없음).
  - 슬라이더 값 변경 시 그래프 즉시 갱신.
  - `maxNodes` 설정 없는 기존 사용자 → 기본값 30으로 정상 동작.
- **i18n 확인**: ko/ja/en에서 새 설정 문자열 정상 표시.
- **수동 확인**: Obsidian에서 링크·백링크가 많은 노트로 실환경 확인.

## 4. 롤백

- 변경은 설정 1개 추가 + 노드 루프 가드 + 엣지 필터 + UI/문자열에 국한. 문제 시 상한 가드와 엣지 필터를 제거하면 기존 무제한 동작으로 복귀.
