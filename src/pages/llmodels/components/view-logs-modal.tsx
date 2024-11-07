import LogsViewer from '@/components/logs-viewer/virtual-log-list';
import { useIntl } from '@umijs/max';
import { Modal } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

type ViewModalProps = {
  open: boolean;
  url: string;
  tail?: number;
  autoScroll?: boolean;
  onCancel: () => void;
};

const ViewCodeModal: React.FC<ViewModalProps> = (props) => {
  const { open, url, onCancel, tail } = props || {};
  const [modalSize, setModalSize] = useState<any>({
    width: 600,
    height: 420
  });
  const isFullScreenRef = React.useRef(false);
  const logsViewerRef = React.useRef<any>(null);
  const intl = useIntl();
  const viewportHeight = window.innerHeight;
  const viewHeight = viewportHeight - 86;

  const handleFullscreenToggle = useCallback(() => {
    isFullScreenRef.current = !isFullScreenRef.current;
    setModalSize((size: any) => {
      return {
        width: size.width === 600 ? '100%' : 600,
        height: size.height === 420 ? viewHeight : 420
      };
    });
  }, []);

  const handleCancel = useCallback(() => {
    logsViewerRef.current?.abort();
    onCancel();
  }, [onCancel]);

  useEffect(() => {
    if (open) {
      isFullScreenRef.current = false;
      setModalSize({
        width: '100%',
        height: viewHeight
      });
    }
  }, [open]);

  return (
    <Modal
      title={
        <span className="flex flex-center">
          <span style={{ fontWeight: 'var(--font-weight-bold)' }}>
            {' '}
            {intl.formatMessage({ id: 'common.button.viewlog' })}
          </span>
        </span>
      }
      open={open}
      centered={true}
      onCancel={handleCancel}
      destroyOnClose={true}
      closeIcon={true}
      maskClosable={false}
      keyboard={true}
      styles={{
        content: {
          borderRadius: 0
        }
      }}
      width={modalSize.width}
      footer={null}
    >
      <LogsViewer
        ref={logsViewerRef}
        height={modalSize.height}
        diffHeight={93}
        url={url}
        tail={tail}
        params={{
          follow: true
        }}
      ></LogsViewer>
    </Modal>
  );
};

export default React.memo(ViewCodeModal);
