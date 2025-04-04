import IconFont from '@/components/icon-font';
import SealAutoComplete from '@/components/seal-form/auto-complete';
import useAppUtils from '@/hooks/use-app-utils';
import { useIntl } from '@umijs/max';
import { Form, Typography } from 'antd';
import React from 'react';
import { modelSourceMap, ollamaModelOptions } from '../config';
import { useFormContext, useFormInnerContext } from '../config/form-context';
import { FormData } from '../config/types';

const OllamaForm: React.FC = () => {
  const formCtx = useFormContext();
  const formInnerCtx = useFormInnerContext();
  const { byBuiltIn } = formCtx;
  const { getRuleMessage } = useAppUtils();
  const intl = useIntl();
  const source = Form.useWatch('source');
  const formInstance = Form.useFormInstance();

  if (![modelSourceMap.ollama_library_value].includes(source) || byBuiltIn) {
    return null;
  }
  return (
    <>
      <Form.Item<FormData>
        name="ollama_library_model_name"
        key="ollama_library_model_name"
        rules={[
          {
            required: true,
            message: getRuleMessage('input', 'models.table.name')
          }
        ]}
      >
        <SealAutoComplete
          allowClear
          filterOption
          defaultActiveFirstOption
          disabled={false}
          options={ollamaModelOptions}
          description={
            <span>
              <span>
                {intl.formatMessage({ id: 'models.form.ollamalink' })}
              </span>
              <Typography.Link
                className="flex-center"
                href="https://www.ollama.com/library"
                target="_blank"
              >
                <IconFont
                  type="icon-external-link"
                  className="font-size-14"
                ></IconFont>
              </Typography.Link>
            </span>
          }
          label={intl.formatMessage({ id: 'model.form.ollama.model' })}
          placeholder={intl.formatMessage({ id: 'model.form.ollamaholder' })}
          required
        ></SealAutoComplete>
      </Form.Item>
    </>
  );
};

export default OllamaForm;
