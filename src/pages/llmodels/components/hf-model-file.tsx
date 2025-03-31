import { createAxiosToken } from '@/hooks/use-chunk-request';
import { convertFileSize } from '@/utils';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Col, Empty, Row, Select, Spin, Tag, Tooltip } from 'antd';
import classNames from 'classnames';
import _ from 'lodash';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import {
  evaluationsModelSpec,
  queryHuggingfaceModelFiles,
  queryModelScopeModelFiles
} from '../apis';
import { modelSourceMap } from '../config';
import { getFileType } from '../config/file-type';
import '../style/hf-model-file.less';
import FileParts from './file-parts';
import IncompatiableInfo from './incompatiable-info';
import TitleWrapper from './title-wrapper';

interface HFModelFileProps {
  isDownload?: boolean;
  selectedModel: any;
  collapsed?: boolean;
  loadingModel?: boolean;
  modelSource: string;
  ref: any;
  onSelectFile?: (file: any) => void;
}

const pattern = /^(.*)-(\d+)-of-(\d+)\.(.*)$/;

const filterReg = /\.(safetensors|gguf)$/i;
const includeReg = /\.(safetensors|gguf)$/i;
const filterRegGGUF = /\.(gguf)$/i;

const FilePartsTag = (props: { parts: any[] }) => {
  if (!props.parts || !props.parts.length) {
    return null;
  }
  const { parts } = props;
  return (
    <Tooltip
      overlayInnerStyle={{
        width: 180,
        padding: 0
      }}
      title={<FileParts fileList={parts}></FileParts>}
    >
      <Tag
        className="tag-item"
        color="purple"
        style={{
          marginRight: 0
        }}
      >
        <span style={{ opacity: 1 }}>
          <InfoCircleOutlined className="m-r-5" />
          {parts.length} parts
        </span>
      </Tag>
    </Tooltip>
  );
};

const HFModelFile: React.FC<HFModelFileProps> = forwardRef((props, ref) => {
  const { collapsed, modelSource, isDownload } = props;
  const intl = useIntl();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [dataSource, setDataSource] = useState<any>({
    fileList: [],
    loading: false
  });
  const [sortType, setSortType] = useState<string>('size');
  const [current, setCurrent] = useState<string>('');
  const modelFilesSortOptions = useRef<any[]>([
    {
      label: intl.formatMessage({ id: 'models.sort.size' }),
      value: 'size'
    },
    {
      label: intl.formatMessage({ id: 'models.sort.name' }),
      value: 'name'
    }
  ]);
  const axiosTokenRef = useRef<any>(null);
  const checkTokenRef = useRef<any>(null);
  const timer = useRef<any>(null);

  const handleSelectModelFile = (item: any) => {
    props.onSelectFile?.(item);
    setCurrent(item.path);
  };

  const parseFilename = (filename: string) => {
    const match = filename.match(pattern);

    if (match) {
      return {
        filename: match[1],
        part: parseInt(match[2], 10),
        total: parseInt(match[3], 10),
        extension: match[4]
      };
    } else {
      return null;
    }
  };

  const generateGroupByFilename = useCallback((list: any[]) => {
    // general file
    const generalFileList = _.filter(list, (item: any) => {
      const parsed = parseFilename(item.path);
      return !parsed;
    });

    const newGeneralFileList = _.map(generalFileList, (item: any) => {
      return {
        ...item,
        fakeName: item.path
      };
    });

    // shard file

    const shardFileList = _.filter(list, (item: any) => {
      const parsed = parseFilename(item.path);
      return !!parsed;
    });

    const newShardFileList = _.map(shardFileList, (item: any) => {
      const parsed = parseFilename(item.path);
      return {
        ...item,
        ...parsed
      };
    });

    const group = _.groupBy(newShardFileList, 'filename');

    const shardFileListResult = _.map(
      group,
      (value: any[], filename: string) => {
        return {
          path: filename,
          fakeName: `${filename}-*.${_.get(value, '[0].extension')}`,
          size: _.sumBy(value, 'size'),
          parts: value
        };
      }
    );

    return [...shardFileListResult, ...newGeneralFileList];
  }, []);

  const hfFileFilter = (file: any) => {
    return filterRegGGUF.test(file.path) || _.includes(file.path, '.gguf');
  };

  // hugging face files
  const getHuggingfaceFiles = async () => {
    try {
      const res = await queryHuggingfaceModelFiles(
        { repo: props.selectedModel.name || '' },
        {
          signal: axiosTokenRef.current.signal
        }
      );
      const fileList = _.filter(res, (file: any) => {
        return file.type === 'file';
      });

      const list = _.filter(fileList, (file: any) => {
        return hfFileFilter(file) && file.path.indexOf('mmproj') === -1;
      });

      return list;
    } catch (error) {
      return [];
    }
  };

  const modelscopeFileFilter = (file: any) => {
    return (
      filterRegGGUF.test(file.Path) &&
      file.Type === 'blob' &&
      file.Path.indexOf('mmproj') === -1
    );
  };

  // modelscope files
  const getModelScopeFiles = async () => {
    try {
      const data = await queryModelScopeModelFiles(
        {
          name: props.selectedModel.name || '',
          revision: props.selectedModel.revision || 'master'
        },
        {
          signal: axiosTokenRef.current.signal
        }
      );
      const fileList = _.filter(_.get(data, ['Data', 'Files']), (file: any) => {
        return modelscopeFileFilter(file);
      });

      const list = _.map(fileList, (item: any) => {
        return {
          path: item.Path,
          size: item.Size
        };
      });
      return list;
    } catch (error) {
      return [];
    }
  };

  const getEvaluateResults = useCallback(async (repoList: any[]) => {
    try {
      checkTokenRef.current?.cancel?.();
      checkTokenRef.current = createAxiosToken();
      const evaluations = await evaluationsModelSpec(
        {
          model_specs: repoList
        },
        {
          token: checkTokenRef.current.token
        }
      );
      return evaluations.results || [];
    } catch (error) {
      return [];
    }
  }, []);

  const handleEvaluate = async (list: any[]) => {
    if (isDownload) {
      return;
    }
    try {
      const evaluateFileList = list.map((item: any) => {
        return {
          source: modelSource,
          ...(modelSource === modelSourceMap.huggingface_value
            ? {
                huggingface_repo_id: props.selectedModel.name,
                huggingface_filename: item.fakeName
              }
            : {
                model_scope_model_id: props.selectedModel.name,
                model_scope_file_path: item.fakeName
              })
        };
      });

      setIsEvaluating(true);

      const evaluationList = await getEvaluateResults(evaluateFileList);

      const resultList = _.map(list, (item: any, index: number) => {
        return {
          ...item,
          evaluateResult: evaluationList[index]
        };
      });
      handleSelectModelFile(resultList[0]);
      setDataSource({ fileList: resultList, loading: false });
      setIsEvaluating(false);
    } catch (error) {
      setIsEvaluating(false);
    }
  };

  const handleFetchModelFiles = async () => {
    if (!props.selectedModel.name) {
      setDataSource({ fileList: [], loading: false });
      handleSelectModelFile({});
      return;
    }
    checkTokenRef.current?.cancel?.();
    axiosTokenRef.current?.abort?.();
    axiosTokenRef.current = new AbortController();
    setDataSource({ ...dataSource, loading: true });
    setCurrent('');
    try {
      let list = [];
      if (modelSourceMap.huggingface_value === modelSource) {
        list = await getHuggingfaceFiles();
      } else if (modelSourceMap.modelscope_value === modelSource) {
        list = await getModelScopeFiles();
      }

      const newList = generateGroupByFilename(list);
      const sortList = _.sortBy(newList, (item: any) => {
        return sortType === 'size' ? item.size : item.path;
      });

      handleSelectModelFile(sortList[0]);
      setDataSource({ fileList: sortList, loading: false });

      // if (timer.current) {
      //   clearTimeout(timer.current);
      // }
      // timer.current = setTimeout(() => {
      //   handleEvaluate(sortList);
      // }, 200);
      handleEvaluate(sortList);
    } catch (error) {
      setDataSource({ fileList: [], loading: false });
      handleSelectModelFile({});
    }
  };

  const handleSortChange = (value: string) => {
    const list = _.sortBy(dataSource.fileList, (item: any) => {
      return value === 'size' ? item.size : item.path;
    });
    setSortType(value);
    setDataSource({ ...dataSource, fileList: list });
  };

  const getModelQuantizationType = useCallback((item: any) => {
    let path = item.path;
    if (item?.parts?.length) {
      path = `${item.path}.gguf`;
    }
    const quanType = getFileType(path);
    if (quanType) {
      return (
        <Tag
          className="tag-item"
          color="cyan"
          style={{
            marginRight: 0
          }}
        >
          {_.toUpper(quanType)}
        </Tag>
      );
    }
    return null;
  }, []);

  const handleOnEnter = (e: any, item: any) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleSelectModelFile(item);
    }
  };
  useImperativeHandle(ref, () => ({
    fetchModelFiles: handleFetchModelFiles
  }));

  useEffect(() => {
    if (!props.selectedModel.name) {
      setDataSource({ fileList: [], loading: false });
      handleSelectModelFile({});
    }
  }, [props.selectedModel?.name]);

  useEffect(() => {
    return () => {
      axiosTokenRef.current?.abort?.();
      checkTokenRef.current?.cancel?.();
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  return (
    <div className="files-wrap">
      <TitleWrapper>
        <span className="title">
          {intl.formatMessage({ id: 'models.available.files' })} (
          {dataSource.fileList.length || 0})
        </span>
        <Select
          value={sortType}
          onChange={handleSortChange}
          labelRender={({ label }) => {
            return (
              <span>
                {intl.formatMessage({ id: 'model.deploy.sort' })}: {label}
              </span>
            );
          }}
          options={modelFilesSortOptions.current}
          size="middle"
          style={{ width: '120px' }}
        ></Select>
      </TitleWrapper>
      {dataSource.loading && (
        <div className="spin-wrapper">
          <Spin
            spinning={dataSource.loading}
            style={{ height: '100%', width: '100%' }}
          ></Spin>
        </div>
      )}
      <SimpleBar
        style={{
          height: collapsed ? 'max-content' : 'calc(100vh - 300px)'
        }}
      >
        <div style={{ padding: '16px 24px' }}>
          {dataSource.fileList.length ? (
            <Row gutter={[16, 24]}>
              {_.map(dataSource.fileList, (item: any) => {
                return (
                  <Col span={24} key={item.path}>
                    <div
                      className={classNames('hf-model-file', {
                        active: item.path === current
                      })}
                      tabIndex={0}
                      onClick={() => handleSelectModelFile(item)}
                      onKeyDown={(e) => handleOnEnter(e, item)}
                    >
                      <div className="title">{item.path}</div>
                      <div className="tags flex-between">
                        <span className="flex-center gap-8">
                          <Tag
                            className="tag-item"
                            color="green"
                            style={{
                              marginRight: 0
                            }}
                          >
                            {convertFileSize(item.size)}
                          </Tag>
                          {getModelQuantizationType(item)}
                          <FilePartsTag parts={item.parts}></FilePartsTag>
                        </span>
                        <IncompatiableInfo
                          isEvaluating={isEvaluating}
                          data={item.evaluateResult}
                        ></IncompatiableInfo>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          ) : (
            !dataSource.loading &&
            !dataSource.fileList.length && (
              <Empty
                imageStyle={{ height: 'auto', marginTop: '20px' }}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={intl.formatMessage({
                  id: 'models.search.nofiles'
                })}
              />
            )
          )}
        </div>
      </SimpleBar>
    </div>
  );
});

export default memo(HFModelFile);
