# PLAN: v0.9.11 — README 개편 및 Donate 버튼 추가

> `SPEC.md`(무엇을·왜)를 바탕으로 "어떻게"를 구체화한 문서입니다.

### 작업 환경 경로

| 구분 | 경로 |
| --- | --- |
| AI 에이전트 문서 폴더 | `/Volumes/SSD1TB/proj/github/dev-vault/.obsidian/plugins/.ai-agent` |
| 개발용 옵시디언 볼트 루트 | `/Volumes/SSD1TB/proj/github/dev-vault` |
| 플러그인 리포 루트 | `<볼트>/.obsidian/plugins/obsidian-inline-graph` |
| GitHub 리모트 | `https://github.com/TKOxff/obsidian-inline-local-graph.git` |

## 1. 현황 및 원인 분석

### 1.1 `manifest.json` — Donate 버튼 없음

```json
{
  "id": "inline-local-graph",
  "name": "Inline Local Graph",
  "version": "0.9.10",
  ...
  "isDesktopOnly": false
}
```

- `fundingUrl` 필드가 없어 커뮤니티 플러그인 카드에 [Donate] 버튼이 렌더링되지 않는다.
- 비교 대상: `hot-reload/manifest.json`은 `"fundingUrl": "https://dirtsimple.org/tips/hot-reload"`를 가지고 있고 버튼이 노출된다.
- → Donate 버튼은 README가 아니라 **매니페스트 메타데이터**가 결정한다.

### 1.2 `README.md` — 정보량 부족

현재 구성: 제목 + 2줄 설명 + 스크린샷 1장 + Usage(1줄) + Features(1항목) + Dependencies. 총 706 bytes.

부족한 항목:

- 설치 방법(커뮤니티 플러그인 / 수동 설치)
- 설정 항목 설명 (실제로는 14개 설정이 존재)
- 실제 활용 사례 — 현재 스크린샷(`res/example.png`)의 예제가 무엇을 보여주는지 불명확
- 후원(Support) 섹션
- 라이선스 표기 (LICENSE 파일은 존재)

### 1.3 예제 볼트 — 데모용 예제 부재

볼트 루트 구성: `README.md`, `animal/`, `inbox/`, `weeks/`, `year/`.
`animal/`(Animal → Mammal/Bird → Dog/Cat/Cow/Chicken/Pigeon)은 링크 구조 **테스트용**이라 의미 전달력이 약하다.
→ "이 플러그인을 왜 쓰는가"를 보여줄 **학습 사례 예제**가 필요하다.

### 1.4 현재 설정값 (스크린샷 기준선, `data.json`)

`nodeShape: "box"`, `nodeFontSize: 15`, `showGraphBorder: false`, `truncateLabels: true`,
`maxLabelLength: 20`, `maxLabelLengthCJK: 10`, `maxNodes: 200`, `zoomScale: 1.395`.

## 2. 설계 및 작업 계획

### 2.1 `fundingUrl` 추가

`manifest.json`에 단일 문자열 형태로 추가한다. (필드 순서는 `isDesktopOnly` 앞, `authorUrl` 뒤)

```json
	"authorUrl": "https://github.com/TKOxff",
	"fundingUrl": "https://www.buymeacoffee.com/<계정명>",
	"isDesktopOnly": false
```

- 다중 플랫폼이 필요해지면 `{ "Buy Me a Coffee": "..." }` 객체 형태로 확장 가능하나, 이번에는 단일 문자열로 간다.
- **확정(0-A)**: `https://www.buymeacoffee.com/tkoxff`

### 2.2 예제 노트 (외국어 단어 학습) — **사용자 작성본으로 확정**

초안으로 제안했던 `japanese/` 트리는 폐기하고, **사용자가 실제로 쓰는 포맷**인 `voca/` 디렉토리 예제를 채택한다.

```
📂 voca/
 ┗ 📂 kanji/
   ┗ 📜 言語.md      → [[げんご]] [[언어]] [[language]] [[言]] [[語]] [[学ぶ]]
```

노트 본문(`voca/kanji/言語.md`) — 표제어 아래에 읽기/한글/영어/구성 한자를 한 줄씩 두고, 예문을 덧붙이는 카드 형식:

```markdown
[[げんご]]
[[언어]] / [[language]]
[[言]][[語]]

> 言語を[[学ぶ]]のは楽しい。
> 언어를 배우는 것은 즐겁다.
```

- **스크린샷 주 대상**: `voca/kanji/言語.md`
  - 아웃고잉 6개(げんご / 언어 / language / 言 / 語 / 学ぶ)가 중심 노드에서 방사형으로 뻗어, 단어 하나의 "가족"이 한눈에 들어온다.
- 다크 테마, `nodeShape: box` 기준으로 촬영 완료.

### 2.3 README 구조안

`AI_GUIDELINES.md` 언어 정책에 따라 **영어**로 작성한다.

| 섹션 | 내용 |
| --- | --- |
| Title + Badges | 플러그인명, GitHub/Obsidian 다운로드 뱃지 |
| Intro | 한 줄 소개 + 메인 스크린샷(`res/example.png` 교체) |
| Why | 노트 하단 여백을 활용해 문맥 전환 없이 연결 관계를 본다 |
| Features | 기존 항목 + 노드 스타일/표시 개수 제한/라벨 truncation/i18n |
| Installation | 커뮤니티 플러그인 설치 + 수동 설치 |
| Usage | 활성화만 하면 노트 하단에 자동 표시 + 컨트롤 바(Outgoing/Incoming/zoom) 설명 |
| Settings | 설정 14개 표 (이름 / 설명 / 기본값) |
| Dependencies | vis-network.js (기존 유지) |
| Support | Buy Me a Coffee 링크 + 뱃지 |
| License | MIT (LICENSE 파일 기준) |

### 2.4 `README-git.md` 처리 방식

- 볼트 안의 플러그인 폴더가 곧 git 리포이므로 `README.md`를 직접 수정해도 되지만, **초안 검토 단계와 실제 반영을 분리**하기 위해 `README-git.md`를 먼저 작성한다.
- 작성 위치: 플러그인 리포 루트(`obsidian-inline-graph/README-git.md`).
- **최종 확정(사용자 지시로 정정)**: `README-git.md`는 **별도 유지 파일이 아니라 `README.md` 대체용 초안**이었다.
  - → 초안 내용을 `README.md`에 덮어쓰고 `README-git.md`는 삭제한다. 리포에 남는 README는 `README.md` 하나뿐.
  - (초기 0-B '안2' 결정은 파일을 계속 병존시키는 의미로 잘못 해석한 것이며, 위 내용으로 대체됨)

### 2.5 스크린샷 (촬영 완료)

- 대상 노트: `voca/kanji/言語.md`
- 테마: 다크 / `nodeShape: box`
- 파일: **`res/example-word.png`** (신규, README 메인 이미지)
- 기존 `res/example.png`는 **`res/example-animal.png`로 리네임**되어 보관 (README에서는 미참조)

### 2.6 다국어 README

**전제**: GitHub은 README의 **자동 언어 감지·전환을 지원하지 않는다.** README는 정적으로 렌더링되며 Accept-Language 협상이 없고, 마크다운 내 `<script>`·iframe·리다이렉트는 새니타이저가 제거한다.
→ 업계 관행인 **파일 분리 + 수동 언어 전환 링크** 방식을 채택한다.

- 파일 구성 (리포 루트):

  | 파일 | 언어 | 비고 |
  | --- | --- | --- |
  | `README.md` | English | GitHub 랜딩 페이지 (메인) |
  | `README.ko.md` | 한국어 | |
  | `README.ja.md` | 日本語 | |

- 세 파일 모두 **제목 바로 아래**에 전환 링크 한 줄을 둔다. 현재 보고 있는 언어는 링크 없이 굵게 표기.

  ```markdown
  **English** | [한국어](./README.ko.md) | [日本語](./README.ja.md)
  ```

- 번역 원칙:
  - 섹션 구성과 설정 표 항목은 영문 원본과 **1:1 대응**을 유지한다(향후 동기화 편의).
  - 설정 이름은 **플러그인 UI에 실제 표시되는 문자열**(`src/i18n.ts`의 ko/ja 값)을 그대로 쓴다. 임의 번역 금지.
  - 이미지·링크·뱃지 경로는 원본과 동일하게 유지.
- 자동 번역 동기화(GitHub Action, Crowdin)는 문서 3개 규모에 과하므로 **비범위**.

### 2.7 변경/생성 파일 목록

| 파일 | 작업 |
| --- | --- |
| `manifest.json` | `fundingUrl` 추가 (+ 버전 bump) |
| `README.md` | 전면 개편 (초안 `README-git.md`로 작성 후 덮어쓰기, 초안 파일은 삭제) |
| `res/example-word.png` | 신규 스크린샷 추가 (README 메인) |
| `res/example.png` → `res/example-animal.png` | 기존 이미지 리네임 보관 |
| `<볼트>/voca/kanji/言語.md` | 예제 노트 (사용자 작성) |
| `<볼트>/README.md` | 예제 링크 추가 (`[[言語]]`) |
| `package.json` / `versions.json` / `CHANGELOG.md` | 버전 bump 시 갱신 |

### 2.8 버전 bump 판단

- 코드 변경은 없지만, **`fundingUrl`이 커뮤니티 목록에 반영되려면 새 릴리즈가 필요**하다. (Obsidian은 릴리즈에 첨부된 `manifest.json`을 읽는다)
- → **0.9.11로 bump 권장.** `manifest.json` / `package.json` / `versions.json`(`"0.9.11": "0.16.0"`) / `CHANGELOG.md` 갱신.

## 3. 테스트 / 검증

- **Donate 버튼**: 릴리즈 후 Obsidian 커뮤니티 플러그인 카드에 [Donate] 노출 확인 → 클릭 시 Buy Me a Coffee 페이지 이동.
- **매니페스트 유효성**: JSON 파싱 정상, 플러그인 재로드 시 오류 없음.
- **예제 노트**: 각 노트의 위키링크가 깨지지 않고(미해결 링크 없음) 인라인 그래프가 의도한 노드 구성으로 렌더링되는지 확인.
- **README 렌더링**: GitHub에서 이미지 경로(`./res/example.png`)·표·뱃지·링크가 정상 표시되는지 확인.
- **정보 누락 확인**: 기존 Usage / Features / Dependencies 내용이 개편본에 모두 포함되었는지 대조.

## 4. 롤백

- 문서/메타데이터 변경에 한정되므로 리스크가 낮다.
- 문제 발생 시 `manifest.json`의 `fundingUrl` 한 줄 제거로 Donate 버튼만 원복 가능.
- README/스크린샷은 git 히스토리에서 이전 버전 복원.
- 예제 노트는 볼트 전용(리포에 포함되지 않음)이므로 폴더 삭제로 원복.
