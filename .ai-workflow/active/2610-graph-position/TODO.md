# TODO: 그래프 표시 위치 선택 (노트 상단/하단)

## 0. 착수 관문

- [x] SPEC 확정 — 사용자 "두가지 게이트 모두 OK" (2026-10-12)
- [x] **착수 지시 수령** — "PLAN TODO 작성하고 브랜치 만들어서 코드작업도 진행해. 결과물만 내가 확인할 수 있게."
- [x] 작업 브랜치 생성 완료 — `feature/2610-graph-position`
- [x] `PLAN.md` 3장 확정 사항 채움 (A는 변경 가능하다고 사용자에게 보고)

## 1. 설정

- [x] `graphPosition` 설정 키와 기본값 `bottom` (`main.ts`)
- [x] 설정 탭 드롭다운 (`InlineGraphSettingTab.ts`)
- [x] i18n 키 en/ko/ja (`i18n.ts`)

## 2. 배치 로직

- [x] `showInlineGraphInEditor()` 상단/하단 배치, 기존 컨테이너 탐색·이동
- [x] `is-top` / `is-bottom` 클래스

## 3. CSS

- [x] 상단 여백, 읽기 모드 readable line width
- [x] 편집 모드 하단 공백 제거 (`:has` + flex-grow 0 + padding-bottom 0)

## 4. 문서

- [x] README.md / README.ko.md / README.ja.md 설정 표·기능 목록
- [x] CHANGELOG.md `Unreleased`

## 5. 검증

- [x] esbuild 번들 성공 (node 없음 → 네이티브 esbuild, PLAN 4장)
- [x] 격리 인스턴스 측정 — 편집 하단 간격 515px→32px, 편집 상단 그래프→제목 32px, 읽기 상단 긴 노트 6개 지점 화면 덮임·그래프 1개, 위치 전환 시 이동·중복 없음, 모드/노트 전환·토글 컨테이너 1개, 대기 중 재렌더 0회
- [ ] 사용자: `npm run build`, `npm run lint` (tsc·eslint는 사용자 환경에서만 가능)
- [ ] 사용자: `test-vault` 수동 확인

## 6. 마무리 (사용자 확인 후 지시 대기)

- [ ] 버전 결정·bump, CHANGELOG 버전 확정
- [ ] PR (`Closes #17`), 태그, 릴리즈, 이슈 코멘트
