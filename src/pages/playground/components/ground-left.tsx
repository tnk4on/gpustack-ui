import useOverlayScroller from '@/hooks/use-overlay-scroller';
import { useIntl, useSearchParams } from '@umijs/max';
import { Spin } from 'antd';
import classNames from 'classnames';
import 'overlayscrollbars/overlayscrollbars.css';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import { OpenAIViewCode, Roles, generateMessages } from '../config';
import { MessageItem, MessageItemAction } from '../config/types';
import useChatCompletion from '../hooks/use-chat-completion';
import '../style/ground-left.less';
import '../style/system-message-wrap.less';
import MessageInput from './message-input';
import MessageContent from './multiple-chat/message-content';
import SystemMessage from './multiple-chat/system-message';
import ParamsSettings from './params-settings';
import ReferenceParams from './reference-params';
import ViewCodeModal from './view-code-modal';

interface MessageProps {
  modelList: Global.BaseOption<string>[];
  loaded?: boolean;
  ref?: any;
}

const GroundLeft: React.FC<MessageProps> = forwardRef((props, ref) => {
  const { modelList } = props;
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const selectModel = searchParams.get('model') || '';
  const [parameters, setParams] = useState<any>({});
  const [systemMessage, setSystemMessage] = useState('');
  const [show, setShow] = useState(false);
  const [collapse, setCollapse] = useState(false);
  const scroller = useRef<any>(null);
  const paramsRef = useRef<any>(null);
  const [actions, setActions] = useState<MessageItemAction[]>([
    'upload',
    'delete',
    'copy'
  ]);

  const { initialize: innitializeParams } = useOverlayScroller();
  const {
    submitMessage,
    handleStopConversation,
    handleAddNewMessage,
    handleClear,
    setMessageList,
    tokenResult,
    messageList,
    loading
  } = useChatCompletion(scroller);

  useImperativeHandle(ref, () => {
    return {
      viewCode() {
        setShow(true);
      },
      setCollapse() {
        setCollapse(!collapse);
      },
      collapse: collapse
    };
  });

  const viewCodeMessage = useMemo(() => {
    return generateMessages([
      { role: Roles.System, content: systemMessage },
      ...messageList
    ]);
  }, [messageList, systemMessage]);

  const handleSendMessage = (message: Omit<MessageItem, 'uid'>) => {
    const currentMessage =
      message.content || message.imgs?.length ? message : undefined;
    submitMessage({
      system: systemMessage
        ? { role: Roles.System, content: systemMessage }
        : undefined,
      current: currentMessage,
      parameters
    });
  };

  const handleCloseViewCode = () => {
    setShow(false);
  };

  const handleSelectModel = () => {};

  const handleOnCheck = (e: any) => {
    const checked = e.target.checked;
    if (checked) {
      setActions(['upload', 'delete', 'copy', 'markdown']);
    } else {
      setActions(['upload', 'delete', 'copy']);
    }
  };

  useEffect(() => {
    if (paramsRef.current) {
      innitializeParams(paramsRef.current);
    }
  }, [paramsRef.current, innitializeParams]);

  return (
    <div className="ground-left-wrapper">
      <div className="ground-left">
        <div className="message-list-wrap" ref={scroller}>
          <>
            <div
              style={{
                marginBottom: 20
              }}
            >
              <SystemMessage
                style={{
                  borderRadius: 'var(--border-radius-mini)',
                  overflow: 'hidden'
                }}
                systemMessage={systemMessage}
                setSystemMessage={setSystemMessage}
              ></SystemMessage>
            </div>

            <div className="content">
              <MessageContent
                messageList={messageList}
                setMessageList={setMessageList}
                editable={true}
                loading={loading}
                actions={actions}
              />
              {loading && (
                <Spin size="small">
                  <div style={{ height: '46px' }}></div>
                </Spin>
              )}
            </div>
          </>
        </div>
        {tokenResult && (
          <div style={{ height: 40 }}>
            <ReferenceParams usage={tokenResult}></ReferenceParams>
          </div>
        )}
        <div className="ground-left-footer">
          <MessageInput
            defaultSize={{
              minRows: 5,
              maxRows: 5
            }}
            actions={[
              'clear',
              'layout',
              'role',
              'upload',
              'add',
              'paste',
              'check'
            ]}
            defaultChecked={false}
            checkLabel="Markdown"
            onCheck={handleOnCheck}
            loading={loading}
            disabled={!parameters.model}
            isEmpty={!messageList.length}
            handleSubmit={handleSendMessage}
            addMessage={handleAddNewMessage}
            handleAbortFetch={handleStopConversation}
            clearAll={handleClear}
            setModelSelections={handleSelectModel}
          />
        </div>
      </div>
      <div
        className={classNames('params-wrapper', {
          collapsed: collapse
        })}
        ref={paramsRef}
      >
        <div className="box">
          <ParamsSettings
            setParams={setParams}
            params={parameters}
            selectedModel={selectModel}
            modelList={modelList}
          />
        </div>
      </div>

      <ViewCodeModal
        {...OpenAIViewCode.chat}
        open={show}
        payload={{
          messages: viewCodeMessage
        }}
        parameters={parameters}
        onCancel={handleCloseViewCode}
        title={intl.formatMessage({ id: 'playground.viewcode' })}
      ></ViewCodeModal>
    </div>
  );
});

export default GroundLeft;
