import React, { lazy, Suspense, useEffect, useState } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import ChunkLoader from '@/components/loader/chunk-loader';
import { generateOAuthURL } from '@/components/shared';
import DesktopWrapper from '@/components/shared_ui/desktop-wrapper';
import Dialog from '@/components/shared_ui/dialog';
import MobileWrapper from '@/components/shared_ui/mobile-wrapper';
import Tabs from '@/components/shared_ui/tabs/tabs';
import TradingViewModal from '@/components/trading-view-chart/trading-view-modal';
import { DBOT_TABS, TAB_IDS } from '@/constants/bot-contents';
import { api_base, updateWorkspaceName } from '@/external/bot-skeleton';
import { CONNECTION_STATUS } from '@/external/bot-skeleton/services/api/observables/connection-status-stream';
import { isDbotRTL } from '@/external/bot-skeleton/utils/workspace';
import { useApiBase } from '@/hooks/useApiBase';
import { useStore } from '@/hooks/useStore';
import {
    LabelPairedChartLineCaptionRegularIcon,
    LabelPairedObjectsColumnCaptionRegularIcon,
    LabelPairedPuzzlePieceTwoCaptionBoldIcon,
} from '@deriv/quill-icons/LabelPaired';
import { LegacyGuide1pxIcon } from '@deriv/quill-icons/Legacy';
import { Localize, localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import RunPanel from '../../components/run-panel';
import ChartModal from '../chart/chart-modal';
import Dashboard from '../dashboard';
import RunStrategy from '../dashboard/run-strategy';
import './main.scss';

// Existing lazy imports
const ChartWrapper = lazy(() => import('../chart/chart-wrapper'));
const Tutorial = lazy(() => import('../tutorials'));

// New lazy imports for your added tabs
const AnalysisTool = lazy(() => import('../analysis-tool'));
const FreeBots = lazy(() => import('../free-bots'));
const AI = lazy(() => import('../ai'));
const CopyTrading = lazy(() => import('../copy-trading'));
const TradingView = lazy(() => import('../trading-view'));
const RiskManager = lazy(() => import('../risk-manager'));

const AppWrapper = observer(() => {
    const { connectionStatus } = useApiBase();
    const { dashboard, load_modal, run_panel, quick_strategy, summary_card } = useStore();
    const {
        active_tab,
        active_tour,
        is_chart_modal_visible,
        is_trading_view_modal_visible,
        setActiveTab,
        setWebSocketState,
        setActiveTour,
        setTourDialogVisibility,
    } = dashboard;
    const { dashboard_strategies } = load_modal;
    const {
        is_dialog_open,
        is_drawer_open,
        dialog_options,
        onCancelButtonClick,
        onCloseDialog,
        onOkButtonClick,
        stopBot,
    } = run_panel;
    const { is_open } = quick_strategy;
    const { cancel_button_text, ok_button_text, title, message, dismissable, is_closed_on_cancel } = dialog_options as {
        [key: string]: string;
    };
    const { clear } = summary_card;
    const { DASHBOARD, BOT_BUILDER } = DBOT_TABS;
    const init_render = React.useRef(true);
    // Update hash to reflect all tabs, in the same order as below
    const hash = [
        'dashboard', 'bot_builder', 'chart', 'tutorial',
        'analysis_tool', 'free_bots', 'ai', 'copy_trading', 'trading_view', 'risk_manager'
    ];
    const { isDesktop } = useDevice();
    const location = useLocation();
    const navigate = useNavigate();
    const [left_tab_shadow, setLeftTabShadow] = useState<boolean>(false);
    const [right_tab_shadow, setRightTabShadow] = useState<boolean>(false);

    let tab_value: number | string = active_tab;
    const GetHashedValue = (tab: number) => {
        tab_value = location.hash?.split('#')[1];
        if (!tab_value) return tab;
        return Number(hash.indexOf(String(tab_value)));
    };
    const active_hash_tab = GetHashedValue(active_tab);

    useEffect(() => {
        const el_dashboard = document.getElementById('id-dbot-dashboard');
        const el_tutorial = document.getElementById('id-tutorials');

        if (el_dashboard && el_tutorial) {
            const observer_dashboard = new window.IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setLeftTabShadow(false);
                        return;
                    }
                    setLeftTabShadow(true);
                },
                { root: null, threshold: 0.5 }
            );
            const observer_tutorial = new window.IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setRightTabShadow(false);
                        return;
                    }
                    setRightTabShadow(true);
                },
                { root: null, threshold: 0.5 }
            );
            observer_dashboard.observe(el_dashboard);
            observer_tutorial.observe(el_tutorial);
            return () => {
                observer_dashboard.disconnect();
                observer_tutorial.disconnect();
            };
        }
    }, []);

    useEffect(() => {
        if (connectionStatus !== CONNECTION_STATUS.OPENED) {
            const is_bot_running = document.getElementById('db-animation__stop-button') !== null;
            if (is_bot_running) {
                clear();
                stopBot();
                api_base.setIsRunning(false);
                setWebSocketState(false);
            }
        }
    }, [clear, connectionStatus, setWebSocketState, stopBot]);

    // Update tab shadows height to match bot builder height
    const updateTabShadowsHeight = () => {
        const botBuilderEl = document.getElementById('id-bot-builder');
        const leftShadow = document.querySelector('.tabs-shadow--left') as HTMLElement;
        const rightShadow = document.querySelector('.tabs-shadow--right') as HTMLElement;

        if (botBuilderEl && leftShadow && rightShadow) {
            const height = botBuilderEl.offsetHeight;
            leftShadow.style.height = `${height}px`;
            rightShadow.style.height = `${height}px`;
        }
    };

    useEffect(() => {
        updateTabShadowsHeight();

        if (is_open) {
            setTourDialogVisibility(false);
        }

        if (init_render.current) {
            setActiveTab(Number(active_hash_tab));
            if (!isDesktop) handleTabChange(Number(active_hash_tab));
            init_render.current = false;
        } else {
            navigate(`#${hash[active_tab] || hash[0]}`);
        }
        if (active_tour !== '') {
            setActiveTour('');
        }

        // Prevent scrolling when tutorial tab is active (only on mobile)
        const mainElement = document.querySelector('.main__container');
        if (active_tab === DBOT_TABS.TUTORIAL && !isDesktop) {
            document.body.style.overflow = 'hidden';
            if (mainElement instanceof HTMLElement) {
                mainElement.classList.add('no-scroll');
            }
        } else {
            document.body.style.overflow = '';
            if (mainElement instanceof HTMLElement) {
                mainElement.classList.remove('no-scroll');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active_tab]);

    useEffect(() => {
        const trashcan_init_id = setTimeout(() => {
            if (active_tab === BOT_BUILDER && window.Blockly?.derivWorkspace?.trashcan) {
                const trashcanY = window.innerHeight - 250;
                let trashcanX;
                if (is_drawer_open) {
                    trashcanX = isDbotRTL() ? 380 : window.innerWidth - 460;
                } else {
                    trashcanX = isDbotRTL() ? 20 : window.innerWidth - 100;
                }
                window.Blockly?.derivWorkspace?.trashcan?.setTrashcanPosition(trashcanX, trashcanY);
            }
        }, 100);

        return () => {
            clearTimeout(trashcan_init_id);
        };
    }, [active_tab, is_drawer_open]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (dashboard_strategies.length > 0) {
            timer = setTimeout(() => {
                updateWorkspaceName();
            });
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [dashboard_strategies, active_tab]);

    const handleTabChange = React.useCallback(
        (tab_index: number) => {
            setActiveTab(tab_index);
            const el_id = TAB_IDS[tab_index];
            if (el_id) {
                const el_tab = document.getElementById(el_id);
                setTimeout(() => {
                    el_tab?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }, 10);
            }
        },
        [active_tab]
    );

    const handleLoginGeneration = () => {
        window.location.replace(generateOAuthURL());
    };

    return (
        <React.Fragment>
            <div className='main'>
                <div
                    className={classNames('main__container', {
                        'main__container--active': active_tour && active_tab === DASHBOARD && !isDesktop,
                    })}
                >
                    <div>
                        {!isDesktop && left_tab_shadow && <span className='tabs-shadow tabs-shadow--left' />}
                        <Tabs active_index={active_tab} className='main__tabs' onTabItemClick={handleTabChange} top>
                            {/* Dashboard */}
                            <div
                                label={
                                    <>
                                        <LabelPairedObjectsColumnCaptionRegularIcon
                                            height='24px'
                                            width='24px'
                                            fill='var(--text-general)'
                                        />
                                        <Localize i18n_default_text='Dashboard' />
                                    </>
                                }
                                id='id-dbot-dashboard'
                            >
                                <Dashboard handleTabChange={handleTabChange} />
                            </div>
                            {/* Bot Builder */}
                            <div
                                label={
                                    <>
                                        <LabelPairedPuzzlePieceTwoCaptionBoldIcon
                                            height='24px'
                                            width='24px'
                                            fill='var(--text-general)'
                                        />
                                        <Localize i18n_default_text='Bot Builder' />
                                    </>
                                }
                                id='id-bot-builder'
                            >
                                {/* You can add content for Bot Builder tab here if needed */}
                            </div>
                            {/* Charts */}
                            <div
                                label={
                                    <>
                                        <LabelPairedChartLineCaptionRegularIcon
                                            height='24px'
                                            width='24px'
                                            fill='var(--text-general)'
                                        />
                                        <Localize i18n_default_text='Charts' />
                                    </>
                                }
                                id={
                                    is_chart_modal_visible || is_trading_view_modal_visible
                                        ? 'id-charts--disabled'
                                        : 'id-charts'
                                }
                            >
                                <Suspense
                                    fallback={<ChunkLoader message={localize('Please wait, loading chart...')} />}
                                >
                                    <ChartWrapper show_digits_stats={false} />
                                </Suspense>
                            </div>
                            {/* Tutorials */}
                            <div
                                label={
                                    <>
                                        <LegacyGuide1pxIcon
                                            height='16px'
                                            width='16px'
                                            fill='var(--text-general)'
                                            className='icon-general-fill-g-path'
                                        />
                                        <Localize i18n_default_text='Tutorials' />
                                    </>
                                }
                                id='id-tutorials'
                            >
                                <div className='tutorials-wrapper'>
                                    <Suspense
                                        fallback={
                                            <ChunkLoader message={localize('Please wait, loading tutorials...')} />
                                        }
                                    >
                                        <Tutorial handleTabChange={handleTabChange} />
                                    </Suspense>
                                </div>
                            </div>
                            {/* Analysis Tool */}
                            <div
                                label={
                                    <>
                                        <span role="img" aria-label="analysis" style={{ marginRight: 4 }}>📊</span>
                                        <Localize i18n_default_text="Analysis Tool" />
                                    </>
                                }
                                id='id-analysis-tool'
                            >
                                <Suspense fallback={<ChunkLoader message="Loading Analysis Tool..." />}>
                                    <AnalysisTool />
                                </Suspense>
                            </div>
                            {/* Free Bots */}
                            <div
                                label={
                                    <>
                                        <span role="img" aria-label="bot" style={{ marginRight: 4 }}>🤖</span>
                                        <Localize i18n_default_text="Free Bots" />
                                    </>
                                }
                                id='id-free-bots'
                            >
                                <Suspense fallback={<ChunkLoader message="Loading free Bots..." />}>
                                    <FreeBots />
                                </Suspense>
                            </div>
                            {/* AI */}
                            <div
                                label={
                                    <>
                                        <span role="img" aria-label="ai" style={{ marginRight: 4 }}>🧠</span>
                                        <Localize i18n_default_text="AI" />
                                    </>
                                }
                                id='id-ai'
                            >
                                <Suspense fallback={<ChunkLoader message="Loading ai..." />}>
                                    <AI />
                                </Suspense>
                            </div>
                            {/* Copy Trading */}
                            <div
                                label={
                                    <>
                                        <span role="img" aria-label="copy trading" style={{ marginRight: 4 }}>🔄</span>
                                        <Localize i18n_default_text="Copy Trading" />
                                    </>
                                }
                                id='id-copy-trading'
                            >
                                <Suspense fallback={<ChunkLoader message="Loading Copy Trading..." />}>
                                    <CopyTrading />
                                </Suspense>
                            </div>
                            {/* Trading View */}
                            <div
                                label={
                                    <>
                                        <span role="img" aria-label="trading view" style={{ marginRight: 4 }}>📈</span>
                                        <Localize i18n_default_text="Trading View" />
                                    </>
                                }
                                id='id-trading-view'
                            >
                                <Suspense fallback={<ChunkLoader message="Loading Trading View..." />}>
                                    <TradingView />
                                </Suspense>
                            </div>
                            {/* Risk Manager */}
                            <div
                                label={
                                    <>
                                        <span role="img" aria-label="risk manager" style={{ marginRight: 4 }}>🛡️</span>
                                        <Localize i18n_default_text="Risk Manager" />
                                    </>
                                }
                                id='id-risk-manager'
                            >
                                <Suspense fallback={<ChunkLoader message="Loading Risk Manager..." />}>
                                    <RiskManager />
                                </Suspense>
                            </div>
                        </Tabs>
                        {!isDesktop && right_tab_shadow && <span className='tabs-shadow tabs-shadow--right' />}
                    </div>
                </div>
            </div>
            <DesktopWrapper>
                <div className='main__run-strategy-wrapper'>
                    <RunStrategy />
                    <RunPanel />
                </div>
                <ChartModal />
                <TradingViewModal />
            </DesktopWrapper>
            <MobileWrapper>{!is_open && <RunPanel />}</MobileWrapper>
            <Dialog
                cancel_button_text={cancel_button_text || localize('Cancel')}
                className='dc-dialog__wrapper--fixed'
                confirm_button_text={ok_button_text || localize('Ok')}
                has_close_icon
                is_mobile_full_width={false}
                is_visible={is_dialog_open}
                onCancel={onCancelButtonClick}
                onClose={onCloseDialog}
                onConfirm={onOkButtonClick || onCloseDialog}
                portal_element_id='modal_root'
                title={title}
                login={handleLoginGeneration}
                dismissable={dismissable}
                is_closed_on_cancel={is_closed_on_cancel}
            >
                {message}
            </Dialog>
        </React.Fragment>
    );
});

export default AppWrapper;