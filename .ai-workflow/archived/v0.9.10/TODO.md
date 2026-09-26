# TODO: v0.9.10 — 표시 노드 최대 개수 제한 옵션

> `PLAN.md`를 바탕으로 한 세부 실행 체크리스트. 완료 시 `[x]` 표시.

## 0. 사전 확인 (코드 작업 착수 전)

- [x] (A) 상한 도달 시 우선순위 확정: 아웃고잉 우선 vs 백링크 우선
  - 결정: 아웃고잉 우선
- [x] (B) 슬라이더 범위 확정: 초안 5~200, step 1, 기본 30
  - 기본: 기본 30, 범위 5~200
- [ ] "코드 작업 진행해줘" 지시 수령

## 1. 구현

- [x] `src/main.ts`: `InlineGraphSettings`에 `maxNodes` 추가 + `DEFAULT_SETTINGS` 기본값 30
- [x] `src/InlineGraphView.ts`: 노드 순회 루프에 상한 가드 추가(신규 추가 전 `nodeSet.size < maxNodes`, `continue`)
- [x] `src/InlineGraphView.ts`: `data` 생성 직전 엣지 필터링(양끝 노드가 모두 `nodeSet`에 있는 것만, 안전망)
- [x] `src/InlineGraphSettingTab.ts`: 'Max displayed nodes' 슬라이더 설정 추가 (Graph 섹션, 5~200)
- [x] `src/i18n.ts`: `maxNodesName` / `maxNodesDesc` 키 en/ko/ja 추가

## 2. 검증

- [x] 노드 총수 > 상한 시 상한까지만 표시 (node 검증)
- [x] 활성 노트 노드는 상한과 무관하게 항상 표시 (node 검증: maxNodes=1 시 활성만)
- [x] dangling edge 없음(잘려나간 노드 참조 엣지 제거) (node 검증: 전 케이스 dangling=0)
- [x] 슬라이더 값 변경 시 그래프 즉시 갱신 (onChange → saveSettings + updateGraphs)
- [x] 기존 설정 없는 사용자 기본값 30 정상 동작(하위 호환) (`settings.maxNodes ?? 30`)
- [ ] i18n: ko/ja/en 새 설정 문자열 표시 확인 (사용자 실환경 확인 필요)
- [x] 빌드(`main.js`) 산출 (`npm run build` tsc 통과 + esbuild)
- [x] Obsidian 실환경 확인(링크·백링크 많은 노트) (사용자 확인 완료)

> 추가 반영(사용자 피드백): 상한에서 활성 노드 제외(이웃 수 기준), UI를 슬라이더→숫자 입력 필드로 변경(폭 축소·우측 정렬), 입력 범위 1~200 명시 및 자동 클램핑.

## 3. 마무리 (릴리즈)

- [x] `manifest.json` / `package.json` / `versions.json` 버전 0.9.10 반영
- [x] 영문 `CHANGELOG.md` 갱신
- [x] 이슈 #13 완료 처리(PR #14 `Closes #13` 자동 종료 + 완료 코멘트)
- [x] 발생한 이슈/에러 `TROUBLE.md`에 한국어 요약 추가 → 해당 없음(특이 이슈·에러 없이 진행)
- [x] 본 작업 폴더 `active/v0.9.10/` → `archived/v0.9.10/` 이동
