import http from '@/utils/http';
import { awaitWrap } from '@/utils/utils';

export const getCronJobList = async (cluster, namespace, params) => {
  let url = `/pixiu/indexer/clusters/${cluster}/resources/cronjob/namespaces/${namespace}`;
  if (namespace === '全部空间') {
    url = `/pixiu/indexer/clusters/${cluster}/resources/cronjob/namespaces/all_namespaces`;
  }

  const [err, result] = await awaitWrap(
    http({
      method: 'get',
      url: url,
      data: params,
    }),
  );
  return [result, err];
};

export const createCronJob = async (cluster, namespace, data) => {
  const [err, result] = await awaitWrap(
    http({
      method: 'post',
      url: `/pixiu/proxy/${cluster}/apis/batch/v1/namespaces/${namespace}/cronjobs`,
      data: data,
    }),
  );
  return [result, err];
};

export const deleteCronJob = async (cluster, namespace, name) => {
  const [err, result] = await awaitWrap(
    http({
      method: 'delete',
      url: `/pixiu/proxy/${cluster}/apis/batch/v1/namespaces/${namespace}/cronjobs/${name}`,
    }),
  );
  return [result, err];
};

export const patchCronJob = async (cluster, namespace, name, data) => {
  const [err, result] = await awaitWrap(
    http({
      method: 'patch',
      url: `/pixiu/proxy/${cluster}/apis/batch/v1/namespaces/${namespace}/cronjobs/${name}`,
      data: data,
      config: {
        headers: {
          'Content-Type': 'application/merge-patch+json',
        },
      },
    }),
  );

  return [result, err];
};

export const getCronJob = async (cluster, namespace, name) => {
  const [err, result] = await awaitWrap(
    http({
      method: 'get',
      url: `/pixiu/proxy/${cluster}/apis/batch/v1/namespaces/${namespace}/cronjobs/${name}`,
    }),
  );
  return [result, err];
};
