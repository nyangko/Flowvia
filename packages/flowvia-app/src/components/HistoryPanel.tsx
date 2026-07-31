import { useTranslation } from 'react-i18next';
import type { IsoflowProps } from 'flowvia';

type Locale = NonNullable<IsoflowProps['locale']>;

interface Props {
  locale: Locale;
  onClose: () => void;
}

interface ChangelogGroup {
  version: string;
  date: string;
  // Each item is [boldedKeyword, restOfSentence] so the key part reads at a glance.
  items: [string, string][];
}

// Changelog entries aren't run through the full 15-language i18n pipeline (they
// change too often for that to be sustainable) — Korean is the primary language
// this app is developed/tested in, English is the fallback for everyone else.
//
// Grouped by version, newest first. When adding new entries, add a new group
// rather than appending to an existing one's `items`.
const CHANGELOG_KO: ChangelogGroup[] = [
  {
    version: 'v1.1.0',
    date: '2026-07-31',
    items: [
      ['노드 설명 표시 방식', ' 개선 — 기본적으로 접혀 있고 title 옆 화살표를 눌러야 펼쳐짐'],
      ['Undo/Redo 버튼', ' 비활성화 표시 오류 수정 (할 일이 없을 때도 활성화된 것처럼 보이던 문제)'],
      ['노드/커넥터/영역 속성 패널', ' 다국어 번역 적용 (레이블 높이, 색상, 커넥터 라벨 등)'],
      ['기본 아이콘 팩(ISOFLOW) 37종', '의 아이콘 이름 다국어 번역 적용'],
      ['노드 우클릭 메뉴', '에 "노드 수정" 항목 추가 (복사 → 수정 → 연결선 추가 순)'],
      ['히스토리/도움말 버튼', ' 위치를 상단 우측 언어 전환 버튼 옆으로 이동'],
      ['다이어그램 저장/불러오기 UI', '를 상단바 다이얼로그 하나로 통합'],
      ['Undo/Redo 버튼', '을 상단 툴바로 이동 (새로 만들기 버튼 왼쪽)'],
      ['다이어그램 제목', '을 클릭해서 바로 수정 가능'],
      ['저장/불러오기/내보내기 다이얼로그', ' UI 개선 (아이콘 추가, 여백 정리)'],
      ['불러오기 버튼', '에 "세션에서 불러오기 / 파일 가져오기" 드롭다운 추가'],
      ['우클릭 메뉴', '에 아이콘 추가 (복사/추가/붙여넣기)'],
      ['노드 우클릭 메뉴', '에서 바로 "연결선 추가" 가능'],
      ['연결선 기본 색상', '을 파스텔 톤으로, 두께는 더 얇게 변경'],
      ['연결선 흐름 방향 애니메이션', ' 추가 (설정 > 연결선에서 켜고 끄기 가능)'],
      ['같은 위치', '에서 연결선 시작/끝을 선택하면 생성되지 않도록 개선'],
      ['연결선 그리는 도중 우클릭', '하면 바로 취소'],
      ['다국어 번역', ' 보강 (툴팁, 우클릭 메뉴 등)']
    ]
  }
];

const CHANGELOG_EN: ChangelogGroup[] = [
  {
    version: 'v1.1.0',
    date: '2026-07-31',
    items: [
      ['Node descriptions', ' now collapse by default — click the arrow next to the title to expand'],
      ['Undo/Redo buttons', ' fixed a bug where they looked enabled even with nothing to undo/redo'],
      ['Node/connector/area panels', ' translated (label height, colors, connector labels, etc.)'],
      ['Base icon pack (ISOFLOW)', ' — all 37 icon names translated'],
      ['Node right-click menu', ' now has an "Edit Node" option (Copy → Edit → Add Connector)'],
      ['History/Help buttons', ' moved next to the language switcher in the top-right'],
      ['Diagram Save/Load UI', ' unified into a single top-bar dialog'],
      ['Undo/Redo', ' moved to the top toolbar (left of New)'],
      ['Diagram title', ' — click it to rename inline'],
      ['Save/Load/Export dialogs', ' redesigned (icons, tighter spacing)'],
      ['Load button', ' now offers a dropdown: load from session or import a file'],
      ['Right-click menu', ' icons added (copy/add/paste)'],
      ['Add Connector', ' directly from a node’s right-click menu'],
      ['Connector colors', ' switched to a pastel palette, thinner lines'],
      ['Connector flow animation', ' added (toggle in Settings > Connector)'],
      ['Same-spot connectors', ' no longer create a duplicate'],
      ['Right-click cancel', ' while drawing a connector'],
      ['Translation coverage', ' broadened for tooltips and the right-click menu']
    ]
  }
];

export const HistoryPanel = ({ locale, onClose }: Props) => {
  const { t, i18n } = useTranslation('app');
  const changelog = i18n.language.startsWith('ko') ? CHANGELOG_KO : CHANGELOG_EN;
  const latest = changelog[0];

  const tips = [
    {
      title: locale.importHintTooltip.title,
      description: [
        locale.importHintTooltip.instructionStart,
        locale.importHintTooltip.menuButton,
        locale.importHintTooltip.instructionMiddle,
        locale.importHintTooltip.openButton,
        locale.importHintTooltip.instructionEnd
      ].join(' ')
    },
    {
      title: locale.connectorHintTooltip.tipCreatingConnectors,
      description: [
        locale.connectorHintTooltip.clickInstructionStart,
        locale.connectorHintTooltip.clickInstructionMiddle,
        locale.connectorHintTooltip.clickInstructionEnd
      ].join(' ')
    },
    {
      title: locale.lazyLoadingWelcome.title,
      description: locale.lazyLoadingWelcome.message
    }
  ];

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2>
          {t('history.title')}
          {latest && (
            <span className="history-version">
              {latest.version} · {latest.date}
            </span>
          )}
        </h2>

        <h3 className="history-section-title">{t('history.whatsNew')}</h3>
        {changelog.map((group) => {
          return (
            <div className="history-version-group" key={group.version}>
              <div className="history-version-heading">
                {group.version} · {group.date}
              </div>
              <ul className="history-list">
                {group.items.map(([bold, rest]) => {
                  return (
                    <li key={bold}>
                      <strong>{bold}</strong>
                      {rest}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        <h3 className="history-section-title">{t('history.tips')}</h3>
        <div className="history-tips">
          {tips.map((tip) => {
            return (
              <div className="history-tip" key={tip.title}>
                <strong>{tip.title}</strong>
                <p>{tip.description}</p>
              </div>
            );
          })}
        </div>

        <div className="dialog-buttons history-dialog-buttons">
          <button onClick={onClose}>{t('dialog.load.btnClose')}</button>
        </div>
      </div>
    </div>
  );
};
