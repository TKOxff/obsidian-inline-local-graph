# TODO: 그래프 표시 위치 선택 (노트 상단/하단)

## 0. 착수 관문

- [x] SPEC 확정 — 사용자 "두가지 게이트 모두 OK" (2026-10-12)
- [x] **착수 지시 수령** — "PLAN TODO 작성하고 브랜치 만들어서 코드작업도 진행해. 결과물만 내가 확인할 수 있게."
- [x] 작업 브랜치 생성 완료 — `feature/2610-graph-position`
- [x] `PLAN.md` 3장 확정 사항 채움 (A는 변경 가능하다고 사용자에게 보고)

## 1. 설정

- [ ] `graphPosition` 설정 키와 기본값 `bottom` (`main.ts`)
- [ ] 설정 탭 드롭다운 (`InlineGraphSettingTab.ts`)
- [ ] i18n 키 en/ko/ja (`i18n.ts`)

## 2. 배치 로직

- [ ] `showInlineGraphInEditor()` 상단/하단 배치, 기존 컨테이너 탐색·이동
- [ ] `is-top` / `is-bottom` 클래스

## 3. CSS

- [ ] 상단 여백, 읽기 모드 readable line width
- [ ] 편집 모드 하단 공백 제거 (`:has` + flex-grow 0 + padding-bottom 0)

## 4. 문서

- [ ] README.md / README.ko.md / README.ja.md 설정 표·기능 목록
- [ ] CHANGELOG.md `Unreleased`

## 5. 검증

- [ ] esbuild 번들 성공 (node 없음 → 네이티브 esbuild, PLAN 4장)
- [ ] 격리 인스턴스 측정: 편집 하단 간격, 편집 상단, 읽기 상단 스크롤, 설정 전환 이동·중복, 모드/노트 전환
- [ ] 사용자: `npm run build`, `npm run lint` (tsc·eslint는 사용자 환경에서만 가능)
- [ ] 사용자: `test-vault` 수동 확인

## 6. 마무리 (사용자 확인 후 지시 대기)

- [ ] 버전 결정·bump, CHANGELOG 버전 확정
- [ ] PR (`Closes #17`), 태그, 릴리즈, 이슈 코멘트
