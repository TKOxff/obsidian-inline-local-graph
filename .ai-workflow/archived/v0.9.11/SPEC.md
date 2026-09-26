# SPEC: v0.9.11 — README 개편 및 Donate 버튼 추가

> "무엇을, 왜" 하는지를 고정하는 문서입니다. "어떻게"는 `PLAN.md`에서 다룹니다.
> SPEC 문서는 기본적으로 체크박스(`[ ]`)를 사용하지 않습니다. (진행 체크는 `TODO.md`의 역할)

| 항목 | 내용 |
| --- | --- |
| **태스크 ID** | v0.9.11 |
| **유형** | Chore (문서/메타데이터) |
| **상태** | Done |
| **작성일** | 2026-08-09 |
| **관련 이슈** | - |

## 1. 목표 (Why)

1. 커뮤니티 플러그인 브라우저(Obsidian 설정 > Community plugins)에서 다른 인기 플러그인들처럼 [Donate] 버튼이 노출되도록 하여 후원 창구를 마련한다.
2. 현재 README.md 내용이 최소한으로만 작성되어 있어, 플러그인 소개 페이지로서의 정보량(사용법, 설정, 스크린샷 등)을 보완한다.
3. 예제/스크린샷을 실제 활용 사례(외국어 단어 학습)로 교체해, 플러그인의 쓸모가 한눈에 전달되도록 한다.

## 2. 작업 범위 (Scope)

- `manifest.json`에 `fundingUrl` 필드 추가 — Buy Me a Coffee 링크.
- README 개편 — 소개/설치/사용법/설정/후원 섹션을 갖춘 소개 페이지 수준으로 보완.
- README 예제를 **외국어 단어 학습**(일본어 한자 단어 — 한글 표기 — 영어 표기) 사례로 교체.
- 스크린샷 촬영용 예제 노트를 개발용 옵시디언 볼트에 생성.
- **다국어 README 제공** — 영어를 메인(`README.md`)으로 두고 한국어·일본어 번역본을 추가, 언어 전환 링크로 상호 연결.

- **노드 모양 기본값 변경** — `Ellipse` → `Box` (사용자 지시로 범위 추가).

### 비범위 (Out of Scope)

- 위 기본값 변경 외의 플러그인 코드 로직 변경.
- 번역본 자동 동기화 파이프라인(GitHub Action / Crowdin 등) 구축.

## 3. 요구사항 / 수용 기준 (Acceptance Criteria)

- `manifest.json`에 유효한 `fundingUrl`(Buy Me a Coffee URL)이 포함되어 있다.
- Obsidian 커뮤니티 플러그인 목록에서 본 플러그인 카드에 [Donate] 버튼이 표시된다(릴리즈 반영 후 확인).
- README에 설치·사용법·설정 목록·후원 링크가 모두 포함되고, 기존 정보(Usage / Features / Dependencies)가 누락되지 않는다.
- README 스크린샷이 외국어 단어 학습 예제로 교체되어 있고, 해당 스크린샷을 재현할 수 있는 예제 노트가 볼트에 존재한다.
- 한국어·일본어 README가 존재하고, 세 문서 모두 상단에서 서로를 오갈 수 있는 언어 전환 링크를 가진다.
- 번역본의 섹션 구성·설정 표 항목이 영문 원본과 1:1로 대응한다.

## 4. 영향 범위 / 고려사항

- 변경 대상: `manifest.json`, `README.md`(+`README-git.md`), `res/` 스크린샷, 개발용 볼트의 예제 노트. **코드 변경 없음.**
- Donate 버튼이 실제로 노출되려면 `manifest.json` 변경이 릴리즈로 배포되어야 한다 → 버전 bump 필요 여부는 `PLAN.md`에서 확정.
- 문서 언어 정책: 볼트 예제 노트/README는 영어 기준(`AI_GUIDELINES.md` 1항), `.ai-agent/` 문서는 한국어.

## 5. 참고 자료

- Obsidian 플러그인 매니페스트 `fundingUrl` 필드 공식 스펙.
- 기존 플러그인 예시: `hot-reload/manifest.json`의 `fundingUrl` 사용 사례.
- 참고 UI: Obsidian 커뮤니티 플러그인 카드의 [Donate] 버튼(Sheets Extended 등).
