---
# --- 브랜치 / 버전 ---
base_branch: master
branch_prefix: feature/
branch_includes_v: true
tag_includes_v: false
version_files:
  - package.json
  - manifest.json
  - versions.json

# --- Git 호스트 / 이슈 ---
git_host: github            # github | gitlab | bitbucket | gitea | other | none
git_cli: gh                 # gh | glab | tea | none
primary_remote: origin
mirror_remotes: []          # 예: [bitbucket] — 태그 생성 후 함께 push
issue_tracker: github       # github | gitlab | bitbucket | jira | redmine | none
issue_ref_style: "Closes #<번호>"   # PR 본문에 넣어 병합 시 자동 종료시키는 문법

# --- 언어 ---
# 판단 기준은 WORKFLOW.md 3장:
#   되돌릴 수 없고 기계가 읽는 것은 영어, 사람이 읽고 논의하는 것은 모국어
doc_language: ko            # .ai-workflow/ 내부 문서, 코드 주석
public_doc_language: en     # README·CHANGELOG, PR 본문, 이슈·코멘트
vcs_language: en            # 커밋 메시지, 브랜치명, 태그, PR 제목
---

# Inline Local Graph — 에이전트 작업 규칙

> 이 파일은 `planfirst`가 읽는 **프로젝트별 설정**입니다.
> 방법론(절차·순서·금지사항)은 `core/WORKFLOW.md`에 있고, 프로젝트마다 달라지는 값만 여기 둡니다.

## 설정 해설

| 키 | 설명 |
| --- | --- |
| `base_branch` | PR을 병합할 기본 브랜치. 여기에 직접 커밋하지 않습니다. |
| `branch_prefix` | 작업 브랜치 접두사. |
| `branch_includes_v` | **태스크명이 버전 번호일 때만** 적용. 폴더 `2610-1.2.0` + `true` → `feature/2610-v1.2.0`. 서술형 태스크명(`2610-doc-policy`)에는 붙이지 않습니다. |
| `tag_includes_v` | `false`면 릴리즈 태그는 `1.2.0`. **브랜치 규칙과 다를 수 있습니다.** |
| `version_files` | 버전 bump 시 함께 고칠 파일 전부. 하나라도 빠지면 릴리즈가 깨집니다. |
| `git_host` | 호스트에 따라 PR 용어와 이슈 종료 방법이 달라집니다. |
| `git_cli` | `none`이면 push 후 나오는 PR 생성 URL을 사용자에게 제시합니다. |
| `primary_remote` | PR을 올릴 주 리모트. |
| `mirror_remotes` | 같은 코드를 여러 호스트에 두는 경우 함께 push할 리모트. |
| `issue_tracker` | `none`이면 이슈 연동 단계를 전부 건너뜁니다. |
| `issue_ref_style` | GitHub/GitLab `Closes #12`, Bitbucket `fixes #12`, Jira `PROJ-12 #close`. |
| `doc_language` | `.ai-workflow/` 내부 작업 문서와 코드 주석. |
| `public_doc_language` | README·CHANGELOG·릴리즈 노트, PR **본문**, 이슈와 코멘트. 사람이 읽고 언제든 고칠 수 있는 것. |
| `vcs_language` | 커밋 메시지, 브랜치명, 태그, PR **제목**. 되돌릴 수 없고 도구가 읽는 것. |

## 태스크 폴더와 브랜치

태스크 폴더명은 **`<yymm>-<태스크명>`** 입니다 (`yymm` = 착수 시점의 연·월, `date +%y%m`). 브랜치명은 **`branch_prefix` + 폴더명**이라 둘이 1:1로 대응합니다.

```
.ai-workflow/active/2610-doc-policy/   →   feature/2610-doc-policy
.ai-workflow/active/2610-1.2.0/        →   feature/2610-v1.2.0   (branch_includes_v: true)
```

릴리즈 태그는 이 규칙과 무관하게 `tag_includes_v` + 버전 번호로 만듭니다.

## 호스트별 참고

- **GitHub:** `gh pr create`, `gh issue close <번호> --comment "..."`

## 프로젝트 고유 규칙

- 빌드 확인은 `npm run build` (`tsc -noEmit` 타입 검사 + esbuild 프로덕션 번들).
- 버전 bump는 `npm version <버전>`으로 한다. `version-bump.mjs`가 `manifest.json`·`versions.json`을 `package.json` 버전에 맞춰 갱신한다.
- `README.md`를 고치면 번역본 `README.ko.md`·`README.ja.md`도 같은 PR에서 함께 고친다.
- 플러그인 동작 확인은 `test-vault/`에서 한다. 새로 clone했으면 `npm run setup-vault`로 빌드 결과물 링크를 만든다.
- `test-vault/.obsidian/plugins/.ai-agent/`는 planfirst 이전 워크플로의 보관본이다. 이력은 `.ai-workflow/`로 복사되었다. 읽기 전용이며 커밋 대상이 아니다.
- `.ai-workflow/archived/v0.9.7` ~ `v0.9.11`, `issues/ISSUES-*.md`는 이전 워크플로에서 옮겨 온 것이라 `yymm` 접두 없는 이름을 그대로 둔다.

## 주요 경로 / 리모트

| 구분 | 값 |
| --- | --- |
| 저장소 루트 | 이 파일이 있는 저장소의 루트 (`git rev-parse --show-toplevel`) |
| 주 리모트 | `https://github.com/TKOxff/obsidian-inline-local-graph.git` |
| 미러 리모트 | 없음 |
