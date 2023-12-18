<template>
  <el-card class="title-card-container">
    <div class="font-container">Release</div>
  </el-card>

  <div style="margin-top: 20px">
    <el-row>
      <el-col>
        <button class="pixiu-two-button">新建</button>
        <el-input
          v-model="data.pageInfo.query"
          placeholder="名称搜索关键字"
          style="width: 420px; float: right"
          clearable
          @input="getReleases"
          @clear="getReleases"
        >
          <template #suffix>
            <el-icon class="el-input__icon" @click="getReleases">
              <component :is="'Search'" />
            </el-icon>
          </template>
        </el-input>

        <el-select
          v-model="data.namespace"
          style="width: 160px; float: right; margin-right: 10px"
          @change="changeNamespace"
        >
          <el-option v-for="item in data.namespaces" :key="item" :value="item" :label="item" />
        </el-select>
      </el-col>
    </el-row>
    <el-card class="box-card">
      <el-table
        v-loading="loading"
        :data="data.releasesList"
        stripe
        style="margin-top: 2px; width: 100%"
        header-row-class-name="pixiu-table-header"
        :cell-style="{
          'font-size': '12px',
          color: '#29292b',
        }"
      >
        <el-table-column type="selection" width="30" />

        <el-table-column prop="metadata.name" label="名称" min-width="150px">
          <template #default="scope">
            <el-link class="global-table-world" type="primary" @click="jumpRoute(scope.row)">
              {{ scope.row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="版本" width="100px">
          <template #default="scope">
            {{ scope.row.version }}
          </template>
        </el-table-column>
        <el-table-column prop="" label="状态" width="150px">
          <template #default="scope">
            <el-tag v-if="scope.row.info.status === 'deployed'" type="success">{{
              scope.row.info.status
            }}</el-tag>
            <el-tag v-else type="danger">{{ scope.row.info.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="" label="Chart" min-width="200px">
          <template #default="scope">
            {{ scope.row.chart.metadata.name }}-{{ scope.row.chart.metadata.version }}
          </template>
        </el-table-column>
        <el-table-column prop="" label="APP版本" width="150px">
          <template #default="scope">
            {{ scope.row.chart.metadata.appVersion }}
          </template>
        </el-table-column>
        <el-table-column label="部署时间" width="180px">
          <template #default="scope">
            {{ formatTimestamp(scope.row.info.first_deployed) }}
          </template>
        </el-table-column>
        <el-table-column prop="" label="上次部署时间" width="180px">
          <template #default="scope">
            {{ formatTimestamp(scope.row.info.first_deployed) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button
              size="small"
              type="text"
              style="margin-right: -20px; margin-left: -10px; color: #006eff"
            >
              查看历史版本
            </el-button>

            <el-button type="text" size="small" style="margin-right: 2px; color: #006eff">
              版本回滚
            </el-button>

            <el-dropdown>
              <span class="el-dropdown-link">
                更多
                <el-icon><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu class="dropdown-buttons">
                  <el-dropdown-item style="color: #006eff" @click="deleteRelease(scope.row)">
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>

        <template #empty>
          <div class="table-inline-word">
            选择的该命名空间的列表为空，可以切换到其他命名空间进行查看
          </div>
        </template>
      </el-table>

      <el-pagination
        v-model:currentPage="data.pageInfo.page"
        v-model:page-size="data.pageInfo.page_size"
        style="float: right; margin-right: 30px; margin-top: 20px; margin-bottom: 20px"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="data.pageInfo.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { formatTimestamp } from '@/utils/utils';
import { reactive, getCurrentInstance, onMounted } from 'vue';

const { proxy } = getCurrentInstance();
const router = useRouter();

const data = reactive({
  cluster: '',
  pageInfo: {
    page: 1,
    limit: 10,
    query: '',
    total: 0,
  },
  loading: false,

  namespace: 'default',
  namespaces: [],
  releasesList: [],

  deploymentReplicasDialog: false,
  deploymentRepcliasFrom: {
    name: '',
    origin: '',
    target: 0,
  },
});

const handleSizeChange = (newSize) => {
  data.pageInfo.limit = newSize;
  getReleases();
};

const handleCurrentChange = (newPage) => {
  data.pageInfo.page = newPage;
  getReleases();
};

onMounted(() => {
  data.cluster = proxy.$route.query.cluster;
  getReleases();
  getNamespaceList();
});

const jumpRoute = (row) => {
  router.push({
    name: 'DeploymentDetail',
    query: {
      name: row.metadata.name,
      namespace: data.namespace,
    },
  });
};

const getReleases = async () => {
  data.loading = true;
  const res = await proxy.$http({
    method: 'get',
    url: `/pixiu/helms/clusters/${data.cluster}/v1/namespaces/${data.namespace}/releases`,
    data: data.pageInfo,
  });

  data.loading = false;
  data.releasesList = res;
  if (res) {
    data.pageInfo.total = data.releasesList.length;
  }
};

const deleteRelease = async (val) => {};

const changeNamespace = async (val) => {
  localStorage.setItem('namespace', val);
  data.namespace = val;
  getReleases();
};

const getNamespaceList = async () => {
  try {
    const result = await proxy.$http({
      method: 'get',
      url: `/proxy/pixiu/${data.cluster}/api/v1/namespaces`,
    });

    for (let item of result.items) {
      data.namespaces.push(item.metadata.name);
    }
  } catch (error) {}
};
</script>

<style scoped="scoped">
.box-card {
  margin-top: 20px;
}
</style>