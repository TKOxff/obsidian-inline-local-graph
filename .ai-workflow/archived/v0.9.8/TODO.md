# TODO: v0.9.8 — Links 토글 추가 및 기본값 변경

> GitHub Issue: #10
> 작성일: 2026-04-05

---

## 1. 설정 추가 (`src/main.ts`)

- [ ] `InlineGraphSettings` 인터페이스에 `showLinks: boolean` 추가
- [ ] `DEFAULT_SETTINGS`에 `showLinks: true` 추가
- [ ] `DEFAULT_SETTINGS`의 `showGraphBorder`를 `true` → `false`로 변경

## 2. 컨트롤 바 UI 변경 (`src/InlineGraphView.ts`)

- [ ] Links 토글 추가 (Backlinks 토글 앞에 배치)
  - 라벨: `Links`
  - 클릭 시 `settings.showLinks` 토글 → `renderTo()` 재호출
- [ ] Refresh 버튼(`⟳`) 및 관련 코드 제거
- [ ] divider 정리: 토글 2개와 줌 버튼 사이에 divider 1개만 유지

## 3. 아웃고잉 링크 조건부 렌더링 (`src/InlineGraphView.ts`)

- [ ] `renderGraph()`의 outgoing links 루프를 `if (settings.showLinks)` 로 감싸기

## 4. 설정 패널 추가 (`src/InlineGraphSettingTab.ts`)

- [ ] "Links (Outgoing links)" 토글 설정 항목 추가 (`Show backlinks` 위에 배치)

## 5. CSS 정리 (`styles.css`)

- [ ] `.inline-graph-refresh-btn` 관련 스타일 블록 제거
- [ ] `.inline-graph-controls.show .inline-graph-refresh-btn` 규칙 제거

## 6. 빌드 및 검증

- [ ] `npm run build` 성공 확인
- [ ] Obsidian에서 기능 테스트 (PLAN.md 테스트 체크리스트 참조)

## 7. 릴리즈

- [ ] 버전 범프 (`manifest.json`, `package.json`, `versions.json`)
- [ ] `CHANGELOG.md` 업데이트
- [ ] feature 브랜치 → PR → merge → GitHub Release
