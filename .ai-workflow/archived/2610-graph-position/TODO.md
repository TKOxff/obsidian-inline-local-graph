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
- [x] `npm run build` 성공, `npm run lint` 새 위반 0건 (기존 비범위 7건 그대로: `no-unsafe-*` 6, `prefer-setting-definitions` 1) — 사용자 승인으로 brew로 node 26.11.1 설치 후 실행
- [x] 사용자: `test-vault` 수동 확인 — "잘 동작하는 것 확인, 제목 위도 문제 없음"

## 6. 마무리 (릴리즈 — 사용자 지시 "이대로 진행해", 버전 1.0.0)

- [x] 버전 1.0.0 (사용자 결정) — `package.json`, `package-lock.json`, `manifest.json`, `versions.json` 수동 수정, CHANGELOG `## 1.0.0`
- [x] `NOTES.md` 승격 — 없음, 건너뜀
- [x] 태스크 폴더 `archived/`로 이동
- [ ] PR 생성 (`Closes #17`) 및 병합
- [ ] 태그 `1.0.0` (v 없음) 및 GitHub 릴리즈 (main.js, manifest.json, styles.css)
- [ ] #17에 결과 코멘트
