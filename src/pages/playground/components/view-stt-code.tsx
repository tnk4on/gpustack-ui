import EditorWrap from '@/components/editor-wrap';
import HighlightCode from '@/components/highlight-code';
import { BulbOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, Modal } from 'antd';
import _ from 'lodash';
import React, { useMemo, useState } from 'react';

type ViewModalProps = {
  systemMessage?: string;
  messageList?: any[];
  payload: Record<string, any>;
  parameters: any;
  title: string;
  api: string;
  clientType: string;
  logcommand?: string;
  open: boolean;
  onCancel: () => void;
};

const langMap = {
  shell: 'bash',
  python: 'python',
  javascript: 'javascript'
};

const langOptions = [
  { label: 'Curl', value: langMap.shell },
  { label: 'Python', value: langMap.python },
  { label: 'Nodejs', value: langMap.javascript }
];

const ViewCodeModal: React.FC<ViewModalProps> = (props) => {
  const {
    title,
    open,
    api,
    clientType,
    logcommand,
    onCancel,
    payload,
    parameters = {}
  } = props || {};

  const intl = useIntl();
  const [lang, setLang] = useState(langMap.shell);

  const BaseURL = `${window.location.origin}/v1-openai`;

  const formatPyParams = (params: any) => {
    return _.keys(params).reduce((acc: string, key: string) => {
      if (params[key] === null) {
        return acc;
      }
      const value =
        typeof params[key] === 'object'
          ? JSON.stringify(params[key], null, 2)
          : `"${params[key]}"`;
      return acc + `  ${key}=${value},\n`;
    }, '  file=audio_file\n');
  };

  const codeValue = useMemo(() => {
    const consoleLog = `console.log(response.text);\n`;

    const printLog = logcommand ? `print(response.${logcommand})` : '';

    if (lang === langMap.shell) {
      const code = `curl ${window.location.origin}/v1-openai/${api} \\\n-H "Content-Type: multipart/form-data" \\\n-H "Authorization: Bearer $\{YOUR_GPUSTACK_API_KEY}" \\\n-F file="@/path/to/file/audio.mp3;type=audio/mpeg" \\\n-F model="${parameters.model}" \\\n-F language="${parameters.language}"`;
      return code;
    }
    if (lang === langMap.javascript) {
      const paramStr = JSON.stringify(
        {
          ...parameters,
          ...payload,
          file: `fs.createReadStream(audio.mp3)`
        },
        null,
        4
      );
      const params = paramStr.replace(
        /"fs.createReadStream\(audio.mp3\)"/g,
        'fs.createReadStream("audio.mp3")'
      );

      const code = `const fs = require("fs")\nconst OpenAI = require("openai");\n\nconst openai = new OpenAI({\n  "apiKey": "YOUR_GPUSTACK_API_KEY",\n  "baseURL": "${BaseURL}"\n});\n\nasync function main(){\n  const params = ${params};\nconst response = await openai.${clientType}(params);\n  ${consoleLog}}\nmain();`;

      return code;
    }
    if (lang === langMap.python) {
      const formattedParams = _.keys(parameters).reduce(
        (acc: string, key: string) => {
          if (parameters[key] === null) {
            return acc;
          }
          const value =
            typeof parameters[key] === 'string'
              ? `"${parameters[key]}"`
              : parameters[key];
          return acc + `  ${key}=${value},\n`;
        },
        ''
      );
      const params = formatPyParams(payload);
      const code = `from openai import OpenAI\n\naudio_file = open("audio.mp3", "rb")\nclient = OpenAI(\n  base_url="${BaseURL}", \n  api_key="YOUR_GPUSTACK_API_KEY"\n)\n\nresponse = client.${clientType}(\n${formattedParams}${params})\nprint('response:', response.text)`;
      return code;
    }
    return '';
  }, [lang, payload, parameters, api, clientType, logcommand]);

  const handleOnChangeLang = (value: string) => {
    setLang(value);
  };

  const handleClose = () => {
    setLang(langMap.shell);
    onCancel();
  };

  return (
    <>
      <Modal
        title={title}
        open={open}
        centered={true}
        onCancel={handleClose}
        destroyOnClose={true}
        closeIcon={true}
        maskClosable={false}
        keyboard={false}
        width={600}
        footer={null}
      >
        <div style={{ marginBottom: '10px' }}>
          {intl.formatMessage({ id: 'playground.viewcode.info' })}
        </div>
        <div>
          <EditorWrap
            copyText={codeValue}
            langOptions={langOptions}
            defaultValue={langMap.shell}
            showHeader={true}
            onChangeLang={handleOnChangeLang}
            styles={{
              wrapper: {
                backgroundColor: 'var(--color-editor-dark)'
              }
            }}
          >
            <div
              style={{
                paddingRight: 2,
                paddingBottom: 2
              }}
            >
              <HighlightCode
                height={380}
                theme="dark"
                code={codeValue}
                lang={lang}
                copyable={false}
              ></HighlightCode>
            </div>
          </EditorWrap>
          <div
            style={{ marginTop: 10, display: 'flex', alignItems: 'baseline' }}
          >
            <BulbOutlined className="m-r-8" />
            <span>
              {intl.formatMessage(
                { id: 'playground.viewcode.tips' },
                {
                  here: (
                    <Button
                      type="link"
                      size="small"
                      href="#/api-keys"
                      target="_blank"
                      style={{ paddingInline: 2 }}
                    >
                      <span>
                        {' '}
                        {intl.formatMessage({
                          id: 'playground.viewcode.here'
                        })}
                      </span>
                    </Button>
                  )
                }
              )}
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default React.memo(ViewCodeModal);
