# PLAN: v0.9.8 — Links 토글 추가 및 기본값 변경

> GitHub Issue: #10
> 작성일: 2026-04-05

---

## 1. 현황 및 원인 분석

### 현재 컨트롤 바 구성 (v0.9.7)
```
[Backlinks 토글] | [⟳ Refresh] | [-] [+]
```

### 문제점
1. **Outgoing links를 끌 수 없음** — 백링크만 보고 싶을 때 아웃고잉 링크가 항상 표시됨
2. **Refresh 버튼 불필요** — 사용 빈도 낮음, 모바일 세로 모드에서 공간 낭비
3. **`showGraphBorder` 기본값이 `true`** — 테두리 없는 것이 더 깔끔하다는 피드백

### 영향 범위

| 파일 | 변경 내용 |
|------|-----------|
| `src/main.ts` | `InlineGraphSettings` 인터페이스에 `showLinks` 추가, `showGraphBorder` 기본값 변경 |
| `src/InlineGraphView.ts` | Links 토글 UI 추가, Refresh 버튼 제거, outgoing links 조건부 렌더링 |
| `src/InlineGraphSettingTab.ts` | "Links (Outgoing links)" 설정 항목 추가 |
| `styles.css` | Refresh 버튼 CSS 제거 (선택적 정리) |

---

## 2. 설계 및 작업 계획

### 2-1. 설정 추가 (`src/main.ts`)

**InlineGraphSettings 인터페이스:**
```typescript
showLinks: boolean;  // 새로 추가
```

**DEFAULT_SETTINGS:**
```typescript
showLinks: true,           // 기본값: ON (아웃고잉 링크 표시)
showGraphBorder: false,    // 기본값 변경: true → false
```

### 2-2. 컨트롤 바 UI 변경 (`src/InlineGraphView.ts`)

**새 컨트롤 바 레이아웃:**
```
[Links 토글] [Backlinks 토글] | [-] [+]
```

변경 사항:
- **Links 토글 추가**: 기존 Backlinks 토글과 동일한 패턴으로 구현
  - 라벨: `Links` (짧게 — 모바일 세로 모드 대응)
  - `switchSlider.onclick` → `settings.showLinks` 토글 → `renderTo()` 재호출
- **Refresh 버튼 제거**: `refreshBtn` 관련 코드 전체 삭제
- **divider 정리**: Refresh 양쪽의 divider 2개 → 토글과 줌 사이 divider 1개로 변경

### 2-3. 아웃고잉 링크 조건부 렌더링 (`src/InlineGraphView.ts`)

`renderGraph()` 메서드의 outgoing links 루프를 `showLinks` 설정으로 감싸기:

```typescript
// 현재 (항상 렌더링)
for (const target in links) { ... }

// 변경 후 (조건부)
if (settings.showLinks) {
    for (const target in links) { ... }
}
```

> **주의**: `showLinks`를 끄면 아웃고잉 엣지와 해당 노드가 모두 숨겨짐. 현재 노트 노드는 항상 표시.

### 2-4. 설정 패널 추가 (`src/InlineGraphSettingTab.ts`)

기존 `Show backlinks` 설정 위에 추가:

```typescript
new Setting(containerEl)
    .setName('Links (Outgoing links)')
    .setDesc('Toggle whether to display outgoing links in the graph.')
    .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showLinks)
        .onChange(async (value) => {
            this.plugin.settings.showLinks = value;
            await this.plugin.saveSettings();
            this.plugin.updateGraphs();
        }));
```

### 2-5. CSS 정리 (`styles.css`)

- `.inline-graph-refresh-btn` 관련 스타일 블록 제거 (선택적)
- `.inline-graph-controls.show .inline-graph-refresh-btn` 규칙 제거

---

## 3. 테스트 계획

### 기능 테스트 체크리스트

- [ ] Links 토글이 컨트롤 바에 표시되는지 확인
- [ ] Links OFF 시 아웃고잉 엣지와 노드가 숨겨지는지 확인
- [ ] Links OFF + Backlinks ON 시 백링크만 표시되는지 확인
- [ ] Links ON + Backlinks OFF 시 아웃고잉만 표시되는지 확인
- [ ] Links 토글 기본값이 ON인지 확인
- [ ] 설정 패널에 "Links (Outgoing links)" 항목이 표시되는지 확인
- [ ] Refresh 버튼이 제거되었는지 확인
- [ ] `showGraphBorder` 기본값이 `false`로 변경되었는지 확인
- [ ] 모바일 세로 모드에서 컨트롤 바가 넘치지 않는지 확인

### 빌드 테스트

```bash
npm run build
```

### 롤백 계획

모든 변경은 단일 feature 브랜치(`feature/v0.9.8`)에서 진행.
문제 발생 시 브랜치 삭제 후 master에서 재시작.
