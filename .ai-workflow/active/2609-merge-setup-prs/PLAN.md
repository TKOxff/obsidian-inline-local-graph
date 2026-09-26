# PLAN: 2609-merge-setup-prs — 개발 환경 정비 PR 2건 머지

## 1. 현황 및 원인 분석

### 1.1 PR 상태

- #18, #19 모두 base는 `master`, `mergeable: MERGEABLE`, `mergeStateStatus: CLEAN`이다. CI 체크와 리뷰 요구사항은 없다.
- → 추가 작업 없이 바로 머지할 수 있다.

### 1.2 머지 방식 관행

- master 이력에 `Merge pull request #15 ...` 같은 머지 커밋이 남아 있다. 저장소는 merge commit 방식을 써 왔다.
- 머지한 원격 브랜치(`feature/v0.9.x`)도 삭제하지 않고 남겨 두었다.
- → 같은 방식을 따른다.

## 2. 설계 및 작업 계획

### 2.1 #18 머지

- `gh pr merge 18 --merge`

### 2.2 #19 머지

- #18을 머지한 뒤 #19의 mergeable 상태를 다시 확인하고 `gh pr merge 19 --merge`로 머지한다.
- 충돌이 나면 멈추고 사용자에게 묻는다(SPEC 비범위).

### 2.3 태스크 마무리

- `TODO.md`를 갱신하고, 태스크 폴더를 `archived/`로 옮긴 뒤 커밋한다(WORKFLOW §7-5).
- 태스크 PR을 만들어 머지하고, 로컬 master를 최신화한다.

## 3. 착수 전 확정 사항

| | 항목 | 채택안 | 근거 | 결정 |
| --- | --- | --- | --- | --- |
| **A** | 머지 방식 | merge commit (`--merge`) | 기존 이력이 merge commit이다 | 채택 |
| **B** | 머지한 브랜치 처리 | 삭제하지 않음 | 기존 관행 | 채택 |
| **C** | 태스크 브랜치 분기 기준 | #19 브랜치 | master에 `.ai-workflow/`가 없다 | 사용자 승인 |
| **D** | `setup-vault` 미검증 상태로 머지 | 머지 | Node가 없다. 새로 clone할 때만 필요하다 | 사용자 승인 |

## 4. 검증 방침

- PR 상태는 `gh pr view --json state`로 판정한다.
- master에 반영됐는지는 머지 후 `git pull`한 master에서 파일이 있는지(`ls`, `grep`)로 판정한다.

## 5. 롤백 계획

- 문제가 생기면 해당 머지 커밋을 `git revert -m 1 <merge commit>`으로 되돌리는 PR을 만든다.
- 머지 자체는 되돌릴 수 없는 지점이다. revert는 되돌리는 커밋을 새로 남긴다.
