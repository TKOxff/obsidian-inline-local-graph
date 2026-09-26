# TODO: v0.9.11 — README 개편 및 Donate 버튼 추가

> `PLAN.md`를 바탕으로 한 세부 실행 체크리스트. 완료 시 `[x]` 표시.

## 0. 사전 확인 (작업 착수 전)

- [x] (A) **Buy Me a Coffee 계정명/URL 확정** — `fundingUrl`에 넣을 값
  - 결정: `https://www.buymeacoffee.com/tkoxff`
- [x] (B) `README-git.md` 운용 방식 확정
  - 최종: **`README.md`를 덮어쓰고 `README-git.md`는 삭제** (초안 파일이었음 — 안2 해석 정정)
- [x] (C) 버전 bump 확정 — 결정: **0.9.11로 bump**
- [x] (D) 예제 노트 — **사용자가 `voca/kanji/言語.md`로 직접 작성** (초안 `japanese/` 트리는 폐기)
- [x] (E) 스크린샷 테마 확정 — 결정: **다크**
- [x] "작업 진행해줘" 지시 수령

## 1. 예제 노트 (개발용 볼트) — 사용자 작성

- [x] `voca/kanji/言語.md` 작성 (사용자) — 읽기/한글/영어/구성 한자/예문 카드 형식
- [x] 링크 대상 노트 생성 — `げんご`, `언어`, `language`, `言`, `語`, `学ぶ`
- [x] 볼트 루트 `README.md`에 `[[言語]]` 링크 추가 (Screenshot Examples 섹션)
- [x] 초안으로 만들었던 `japanese/` 트리 제거

> 실제 그래프 구성: `言語` 중심에서 아웃고잉 6개(げんご / 언어 / language / 言 / 語 / 学ぶ)가
> 방사형으로 뻗는 형태 — 단어 하나의 "가족"이 한눈에 들어옴.

## 2. 스크린샷 촬영

- [x] `voca/kanji/言語.md`에서 메인 스크린샷 촬영 — 다크 테마 (사용자)
- [x] `res/example-word.png` 추가 (178KB)
- [x] 기존 `res/example.png` → `res/example-animal.png` 리네임 보관
- [x] README 이미지 경로를 `./res/example-word.png`로 반영

## 3. README 작성

- [x] 초안 작성 (PLAN 2.3 섹션 구성, 영어)
- [x] Settings 표 작성 — Graph 7개 / Node style 6개 (이름 / 설명 / 기본값), `i18n.ts`·`DEFAULT_SETTINGS` 기준
- [x] Installation 섹션 (커뮤니티 플러그인 + 수동 설치)
- [x] Support 섹션 — Buy Me a Coffee 링크·뱃지
- [x] License 섹션 (LICENSE 파일 확인 — MIT, © 2026 TKOxff)
- [x] 기존 README의 Usage / Features / Dependencies 내용 누락 없이 반영되었는지 대조
- [x] 예제 설명 문단을 실제 스크린샷(`言語`) 내용에 맞게 수정
- [x] **초안을 `README.md`에 덮어쓰고 `README-git.md` 삭제**

## 3-1. 다국어 README (범위 추가 — 사용자 지시)

- [x] GitHub의 자동 언어 감지 지원 여부 조사 → **미지원**, 파일 분리 + 수동 전환 링크 방식 채택 (PLAN 2.6)
- [x] `README.md` 상단에 언어 전환 링크 추가
- [x] `README.ko.md` 작성 (한국어)
- [x] `README.ja.md` 작성 (日本語)
- [x] 설정 표의 항목명·설명을 `src/i18n.ts`의 ko/ja 실제 UI 문자열과 일치시킴 (임의 번역 없음)
- [x] 세 파일 구조 대조 검증 — h2 8개 / 표 행 22개 / 이미지 1개로 전부 동일
- [x] 전환 링크 상호 연결 확인 (현재 언어는 굵게, 나머지는 링크)
- [x] `CHANGELOG.md`에 번역본 항목 추가

## 3-2. 노드 모양 기본값 변경 (범위 추가 — 사용자 지시)

- [x] `src/main.ts` — `DEFAULT_SETTINGS.nodeShape`: `'ellipse'` → `'box'`
- [x] `src/InlineGraphView.ts:167` — 폴백값도 `?? 'box'`로 맞춤 (기본값과 불일치 방지)
- [x] README 3종의 'Node shape' 기본값 표기 갱신 (Box / 박스 / 四角)
- [x] `CHANGELOG.md`에 동작 변경 항목 추가 (기존 사용자 영향 안내 포함)
- [x] 빌드 통과 확인 (`npm run build` — tsc + esbuild)

> 참고: 설정을 한 번도 건드리지 않은 기존 사용자는 업데이트 후 노드가 박스로 바뀐다.
> `main.js`는 `.gitignore` 대상이라 커밋되지 않으며 릴리즈 시 첨부한다.

## 4. 매니페스트 / 버전

- [x] `manifest.json`에 `fundingUrl` 추가 (`https://www.buymeacoffee.com/tkoxff`)
- [x] `manifest.json` / `package.json` 버전 0.9.11 반영
- [x] `versions.json`에 `"0.9.11": "0.16.0"` 추가
- [x] 영문 `CHANGELOG.md`에 0.9.11 항목 추가

## 5. 검증

- [x] JSON 유효성 — `manifest.json` / `package.json` / `versions.json` 파싱 정상
- [x] 예제 노트에서 인라인 그래프가 의도한 노드 구성으로 렌더링 (스크린샷으로 확인)
- [x] README 이미지 경로가 실제 파일과 일치 (`res/example-word.png` 존재)
- [x] 플러그인 재로드 시 오류 없음 — 실환경 확인은 사용자 판단으로 생략(빌드 통과로 갈음)
- [x] GitHub에서 README 렌더링 확인 (이미지 경로 / 표 / 뱃지 / 링크)
- [ ] **(릴리즈 반영 대기)** 커뮤니티 플러그인 카드에 [Donate] 버튼 노출 확인
- [ ] **(릴리즈 반영 대기)** Donate 버튼 클릭 → Buy Me a Coffee 페이지 정상 이동

## 6. 마무리 (릴리즈)

- [x] `feature/v0.9.11` 브랜치 생성 및 전환
- [x] 커밋 3건 → PR #15로 `master` 병합 (merge commit `62127b1`)
- [x] 릴리즈 태그 `0.9.11` 생성 (v 접두사 없음)
- [x] GitHub 릴리즈 생성 — `main.js` / `manifest.json` / `styles.css` 첨부
- [x] 발생한 이슈/에러 `TROUBLE.md`에 한국어 요약 추가 → 해당 없음(특이 이슈·에러 없이 진행)
- [x] 본 작업 폴더 `active/v0.9.11/` → `archived/v0.9.11/` 이동
