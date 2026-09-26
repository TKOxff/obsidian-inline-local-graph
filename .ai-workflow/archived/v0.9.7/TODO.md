# TODO: v0.9.7 — Issue #6 대응 + 코드 정리

> GitHub Issue: [#6 Expose node style](https://github.com/TKOxff/obsidian-inline-local-graph/issues/6)
> 요청자: lewisevelyn | 등록일: 2026-02-09

---

## Phase 1: 코드 정리 및 버그 수정

- [x] 미사용 `leaf` 프로퍼티 및 `WorkspaceLeaf` import 제거 (`InlineGraphView.ts`)
- [x] 미사용 `nodeBgColor` 프로퍼티 제거 (`InlineGraphSettingTab.ts`)
- [x] `getNodeDistance`/`getSpringLength` 중복 함수 → 클래스 static 메서드로 통합 (`InlineGraphView.ts`)
- [x] 미사용 CSS 규칙 `.inline-graph-backlink-row` 제거 (`styles.css`)
- [x] `console.debug` 전부 제거 (`main.ts`, `InlineGraphSettingTab.ts`)

## Phase 2: Issue #6 대응 — 노드 스타일 커스터마이징

- [x] `InlineGraphSettings`에 `truncateLabels`, `maxLabelLength`, `nodeFontSize`, `nodeShape` 추가 (`main.ts`)
- [x] 노드 라벨 말줄임 처리: `truncateLabels` 토글 + 모든 노드에 적용 (`InlineGraphView.ts`)
- [x] `nodeFontSize` 설정을 vis-network `nodes.font.size`에 반영 (`InlineGraphView.ts`)
- [x] `nodeShape` 설정을 vis-network `nodes.shape`에 반영 (`InlineGraphView.ts`)
- [x] 노드 고정 크기 `size: 5` 적용 (`InlineGraphView.ts`)
- [x] 설정 탭을 Graph / Node Style 섹션으로 구분 (`InlineGraphSettingTab.ts`)

## Phase 3: 기존 TODO

- [ ] ~~그래프 컨테이너 100% 너비 검증 및 수정~~ → **다음 버전으로 이월**

## Phase 4: 릴리즈

- [x] `manifest.json` 버전 → 0.9.7
- [x] `package.json` 버전 → 0.9.7
- [x] `versions.json` → `"0.9.7": "0.16.0"`
- [x] 프로덕션 빌드 (`npm run build`) 성공
- [x] `CHANGELOG.md` 작성 (영문, 프로젝트 루트)
- [x] `docs/TODO.md` 완료 항목 반영
- [x] Obsidian 동작 확인 — 사용자 직접 확인
