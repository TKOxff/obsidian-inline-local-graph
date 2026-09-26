# SPEC: 2609-merge-setup-prs — 개발 환경 정비 PR 2건 머지

| 항목 | 내용 |
| --- | --- |
| **태스크 ID** | 2609-merge-setup-prs |
| **유형** | Chore |
| **상태** | Confirmed |
| **작성일** | 2026-09-26 |
| **관련 이슈** | 없음 (PR #18, #19) |

## 1. 목표 (Why)

- 개발 환경을 정비한 PR 두 건을 master에 반영한다. 하나는 테스트 볼트를 레포 안으로 옮기는 PR, 하나는 planfirst 워크플로를 도입하는 PR이다.
- 이후 태스크가 master에서 `.ai-workflow/`와 `test-vault/`를 전제로 시작할 수 있게 한다.

## 2. 작업 범위 (Scope)

- PR #18 `chore/test-vault` 머지 — `test-vault/`, `scripts/setup-test-vault.mjs`, `package.json`의 `setup-vault` 스크립트
- PR #19 `feature/2609-planfirst-init` 머지 — `.ai-workflow/`, `AGENTS.md`, `CLAUDE.md`
- 이 태스크 문서를 아카이브하는 태스크 PR 머지
- 머지 순서: #18 → #19 → 태스크 PR

### 비범위 (Out of Scope)

- 두 PR의 내용 수정 — 리뷰는 이미 대화에서 마쳤다. 머지 전 충돌이 나면 멈추고 묻는다.
- `CHANGELOG.md` 작성, 버전 bump, 릴리즈 태그 — 사용자에게 배포되는 변경이 아니다.
- 머지한 브랜치 삭제 — 기존 관행대로 원격 브랜치를 남긴다.
- untracked 상태인 `package-lock.json` 처리
- `npm run setup-vault` 실행 검증 — Node가 없어서 할 수 없다. 사용자가 미검증 상태로 머지를 승인했다.

## 3. 요구사항 / 수용 기준 (Acceptance Criteria)

- PR #18, #19와 태스크 PR의 상태가 모두 `MERGED`다 (`gh pr view <번호> --json state`).
- 머지 후 master에 `test-vault/`, `scripts/setup-test-vault.mjs`, `.ai-workflow/PROJECT.md`, `AGENTS.md`, `CLAUDE.md`가 있다.
- 머지 후 master의 `package.json` `scripts`에 `setup-vault`가 있다.
- 머지 후 master의 `.ai-workflow/active/`에는 `.gitkeep`만 있고, 이 태스크는 `archived/2609-merge-setup-prs/`에 있다.

## 4. 영향 범위 / 고려사항

- 두 PR이 건드리는 파일은 겹치지 않는다. GitHub도 두 PR을 `MERGEABLE`/`CLEAN`으로 판정했다.
- 절차 이탈(사용자 승인): 이 태스크 브랜치는 master가 아니라 #19 브랜치에서 분기했다. master에 `.ai-workflow/`가 아직 없기 때문이다. #19가 머지되면 태스크 PR의 diff에는 태스크 문서만 남는다.
- 머지는 되돌릴 수 없는 지점이다. 사용자가 "머지까지 진행"을 지시해 승인한 것으로 본다.

## 5. 참고 자료

- PR #18: https://github.com/TKOxff/obsidian-inline-local-graph/pull/18
- PR #19: https://github.com/TKOxff/obsidian-inline-local-graph/pull/19
- `.ai-workflow/PROJECT.md` — `base_branch: master`
