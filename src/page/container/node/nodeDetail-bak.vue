<template>
  <el-card class="contend-card-container">
    <div class="font-container" style="display: flex">
      <pixiu-icon
        name="icon-back"
        style="cursor: pointer"
        size="16px"
        type="iconfont"
        color="#006eff"
        @click="goToNode"
      />

      <el-breadcrumb separator="/" style="margin-left: 10px">
        <el-breadcrumb-item
          ><span class="breadcrumb-create-style"> {{ data.clusterName }} </span>
        </el-breadcrumb-item>
        <el-breadcrumb-item
          ><span class="breadcrumb-create-style"> Node: {{ data.name }} </span>
        </el-breadcrumb-item>
        <el-breadcrumb-item
          ><span class="breadcrumb-create-style"> Node详情 </span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div style="margin-top: 28px"></div>

    <el-tabs
      v-model="data.activeName"
      class="detail-card-new-style"
      @tab-click="handleClick"
      @tab-change="handleChange"
    >
      <el-tab-pane label="基本信息" name="first"> </el-tab-pane>
      <el-tab-pane label="Pod管理" name="second"></el-tab-pane>
      <!-- <el-tab-pane label="监控" name="third"></el-tab-pane> -->
      <el-tab-pane label="事件" name="four"></el-tab-pane>
      <!-- <el-tab-pane label="镜像" name="six"></el-tab-pane> -->
      <el-tab-pane label="YAML" name="five"></el-tab-pane>
    </el-tabs>
  </el-card>

  <div>
    <div v-if="data.activeName === 'six'">
      <div style="margin-top: 20px"></div>
      <el-col>
        <button class="pixiu-two-button" @click="getNodeObject">刷新</button>

        <el-input
          v-model="data.pageInfo.search.searchInfo"
          placeholder="名称搜索关键字"
          style="width: 480px; float: right"
          clearable
          @clear="getNodeObject"
          @input="getNodeObject"
        >
          <template #suffix>
            <pixiu-icon
              name="icon-search"
              style="cursor: pointer"
              size="15px"
              type="iconfont"
              color="#909399"
              @click="getNodeObject"
            />
          </template>
        </el-input>
        <div style="float: right">
          <el-switch v-model="data.eventAutoRefresh" inline-prompt width="36px" /><span
            style="font-size: 13px; margin-left: 5px; margin-right: 10px"
            >自动刷新</span
          >
        </div>
      </el-col>

      <el-card style="margin-top: 15px" class="contend-card-container2">
        <el-table
          v-loading="data.loading"
          :data="data.nodeImages"
          stripe
          style="margin-top: 6px"
          header-row-class-name="pixiu-table-header"
          :cell-style="{
            'font-size': '12px',
            color: '#191919',
          }"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="30" />
          <el-table-column prop="metadata.name" label="名称" min-width="70px"> </el-table-column>

          <el-table-column prop="status" label="Tags" :formatter="formatterStatus" />
          <el-table-column prop="status.podIP" label="Artifacts"> </el-table-column>
          <el-table-column prop="metadata.namespace" label="大小" />
        </el-table>
        <pagination :total="data.pageInfo.total" @on-change="onChange"></pagination>
      </el-card>
    </div>

    <div v-if="data.activeName === 'second'">
      <div style="margin-top: 20px">
        <el-row>
          <el-col>
            <button class="pixiu-two-button" @click="getNodePods">刷新</button>

            <el-input
              v-model="data.pageInfo.search.searchInfo"
              placeholder="名称搜索关键字"
              style="width: 480px; float: right"
              clearable
              @input="searchPods"
              @clear="getNodePods"
            >
              <template #suffix>
                <pixiu-icon
                  name="icon-search"
                  style="cursor: pointer"
                  size="15px"
                  type="iconfont"
                  color="#909399"
                  @click="getNodePods"
                />
              </template>
            </el-input>

            <div style="float: right">
              <el-switch v-model="data.crontab" inline-prompt width="36px" /><span
                style="font-size: 13px; margin-left: 5px; margin-right: 10px"
                >自动刷新</span
              >
            </div>
          </el-col>
        </el-row>
      </div>
      <el-card style="margin-top: 15px" class="contend-card-container2">
        <el-table
          :data="data.tableData"
          stripe
          style="margin-top: 6px"
          header-row-class-name="pixiu-table-header"
          :cell-style="{
            'font-size': '12px',
            color: '#191919',
          }"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="30" />
          <el-table-column prop="metadata.name" label="实例名称" min-width="70px">
            <template #default="scope">
              {{ scope.row.metadata.name }}
              <el-tooltip content="复制">
                <pixiu-icon
                  name="icon-copy"
                  size="11px"
                  type="iconfont"
                  class-name="icon-box"
                  color="#909399"
                  @click="copy(scope.row)"
                />
              </el-tooltip>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" :formatter="formatterStatus" />

          <el-table-column prop="status.podIP" label="实例IP"> </el-table-column>

          <el-table-column
            prop="status.containerStatuses"
            label="重启次数"
            :formatter="getPodRestartCount"
          />

          <el-table-column prop="metadata.namespace" label="命名空间" />

          <el-table-column
            prop="metadata.creationTimestamp"
            label="创建时间"
            :formatter="formatterTime"
          />
          <el-table-column fixed="right" label="操作" width="160px">
            <template #default="scope">
              <el-button
                size="small"
                type="text"
                style="margin-right: -25px; margin-left: -10px; color: #006eff"
                @click="deletePod(scope.row)"
              >
                删除
              </el-button>

              <el-button
                type="text"
                size="small"
                style="margin-right: 1px; color: #006eff"
                @click="openShell(scope.row)"
              >
                远程登录
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination :total="data.pageInfo.total" @on-change="onChange"></pagination>
      </el-card>
    </div>

    <div v-if="data.activeName === 'four'">
      <div style="margin-top: 20px"></div>
      <el-col>
        <button class="pixiu-two-button" @click="getNodeEvents">刷新</button>
        <button style="margin-left: 10px; width: 85px" class="pixiu-two-button2">批量删除</button>

        <el-input
          v-model="data.pageInfo.search.searchInfo"
          placeholder="名称搜索关键字"
          style="width: 480px; float: right"
          clearable
          @clear="getNodeEvents"
        >
          <template #suffix>
            <pixiu-icon
              name="icon-search"
              style="cursor: pointer"
              size="15px"
              type="iconfont"
              color="#909399"
              @click="getNodeEvents"
            />
          </template>
        </el-input>
        <div style="float: right">
          <el-switch v-model="data.eventAutoRefresh" inline-prompt width="36px" /><span
            style="font-size: 13px; margin-left: 5px; margin-right: 10px"
            >自动刷新</span
          >
        </div>
      </el-col>

      <div style="margin-top: 15px">
        <el-card class="contend-card-container2">
          <el-table
            :data="data.eventTableData"
            stripe
            style="margin-top: 10px; width: 100%; margin-bottom: 25px"
            header-row-class-name="pixiu-table-header"
            :cell-style="{
              'font-size': '12px',
              color: '#191919',
            }"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="30px" />
            <el-table-column
              prop="lastTimestamp"
              label="最后出现时间"
              sortable
              :formatter="formatterTime"
            />
            <el-table-column prop="type" label="级别" />

            <el-table-column prop="involvedObject.kind" label="资源类型"> </el-table-column>
            <el-table-column prop="involvedObject.name" label="资源名称" :formatter="formatterName">
            </el-table-column>
            <el-table-column prop="message" label="内容" min-width="250ox" />
            <el-table-column prop="count" label="出现次数"> </el-table-column>

            <el-table-column fixed="right" label="操作" width="100px">
              <template #default="scope">
                <el-button
                  size="small"
                  type="text"
                  style="margin-right: -25px; margin-left: -10px; color: #006eff"
                  @click="deleteEventObject(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination :total="data.pageEventInfo.total" @on-change="onEventChange"></pagination>
        </el-card>
      </div>
    </div>

    <div v-if="data.activeName === 'five'">
      <div style="margin-top: 20px">
        <el-col>
          <button class="pixiu-two-button" style="width: 85px" @click="editYaml">编辑YAML</button>
          <button class="pixiu-two-button" style="margin-left: 10px" @click="copyYmal">复制</button>

          <div style="margin-left: 8px; float: right; margin-top: 6px">
            <pixiu-icon
              name="icon-icon-refresh"
              style="cursor: pointer"
              size="14px"
              type="iconfont"
              color="#909399"
              @click="getDeployment"
            />
          </div>
        </el-col>
      </div>
      <div style="margin-top: 10px"></div>
      <MyCodeMirror :yaml="data.yaml" :read-only="data.readOnly" :height="650"></MyCodeMirror>
      <div v-if="!data.readOnly" style="margin-top: 10px">
        <el-button class="pixiu-cancel-button" @click="cancel()">取消</el-button>
        <el-button class="pixiu-confirm-button" type="primary" @click="confirm()">确定</el-button>
      </div>
    </div>

    <div v-if="data.activeName === 'first'">
      <el-card class="contend-card-container2">
        <div class="big-world-style" style="margin-bottom: 20px">基本信息</div>
        <div
          v-if="data.nodeObject.metadata"
          style="margin-top: 8px; width: 100%; border-radius: 0px"
        >
          <el-form-item label="名称" class="detail-card-style-form">
            <span class="detail-card-style-form2" style="margin-left: 90px">
              {{ data.nodeObject.metadata.name }}
            </span>
          </el-form-item>

          <el-form-item label="创建时间" class="detail-card-style-form">
            <span class="detail-card-style-form2" style="margin-left: 63px">
              {{ data.nodeObject.metadata.creationTimestamp }}
            </span>
          </el-form-item>

          <el-form-item label="Labels" class="detail-card-style-form">
            <span class="detail-card-style-form2" style="margin-left: 75px">
              <div v-if="data.nodeObject.metadata.labels === undefined">-</div>
              <div v-else>
                <div
                  v-for="(item, index) in data.nodeObject.metadata.labels"
                  :key="item"
                  style="margin-top: -1px"
                >
                  <el-tag type="info" style="margin-top: 5px">{{ index }}: {{ item }}</el-tag>
                  <!-- {{ index }}: {{ item }} -->
                </div>
              </div>
            </span>
          </el-form-item>

          <el-form-item label="Annotations" class="detail-card-style-form">
            <span class="detail-card-style-form2" style="margin-left: 42px">
              <div v-if="data.nodeObject.metadata.annotations === undefined">-</div>
              <div v-else>
                <div
                  v-for="(item, index) in data.nodeObject.metadata.annotations"
                  :key="item"
                  style="margin-top: -1px"
                >
                  <el-tag type="info" style="margin-top: 5px">{{ index }}: {{ item }}</el-tag>
                </div>
              </div>
            </span>
          </el-form-item>
        </div>

        <!-- <div class="big-world-style" style="margin-bottom: 20px">运行环境</div> -->
        <el-form-item label="内核版本" class="detail-card-style-form">
          <span class="detail-card-style-form2" style="margin-left: 63px">
            {{ data.nodeObject.status.nodeInfo.kernelVersion }}
          </span>
        </el-form-item>
        <el-form-item label="操作系统" class="detail-card-style-form">
          <span class="detail-card-style-form2" style="margin-left: 63px">
            {{ data.nodeObject.status.nodeInfo.osImage }}
          </span>
        </el-form-item>
        <el-form-item label="容器运行时" class="detail-card-style-form">
          <span class="detail-card-style-form2" style="margin-left: 50px">
            {{ data.nodeObject.status.nodeInfo.containerRuntimeVersion }}
          </span>
        </el-form-item>
        <el-form-item label="kubelet版本" class="detail-card-style-form">
          <span class="detail-card-style-form2" style="margin-left: 45px">
            {{ data.nodeObject.status.nodeInfo.kubeletVersion }}
          </span>
        </el-form-item>
        <el-form-item label="kubeProxy版本" class="detail-card-style-form">
          <span class="detail-card-style-form2" style="margin-left: 26px">
            {{ data.nodeObject.status.nodeInfo.kubeProxyVersion }}
          </span>
        </el-form-item>
        <el-form-item label="podCIDRs" class="detail-card-style-form">
          <span class="detail-card-style-form2" style="margin-left: 55px">
            {{ data.nodeObject.spec.podCIDR }}
          </span>
        </el-form-item>
      </el-card>
      <!-- <el-card class="contend-card-container5">
        <div class="big-world-style" style="margin-bottom: 20px">运行环境</div>
        <div
          v-if="state.nodeObject.metadata"
          style="margin-top: 8px; width: 100%; border-radius: 0px"
        >
          <el-form-item label="内核版本" class="detail-card-style-form">
            <span class="detail-card-style-form2" style="margin-left: 63px">
              {{ state.nodeObject.status.nodeInfo.kernelVersion }}
            </span>
          </el-form-item>
          <el-form-item label="操作系统" class="detail-card-style-form">
            <span class="detail-card-style-form2" style="margin-left: 63px">
              {{ state.nodeObject.status.nodeInfo.osImage }}
            </span>
          </el-form-item>
          <el-form-item label="容器运行时" class="detail-card-style-form">
            <span class="detail-card-style-form2" style="margin-left: 50px">
              {{ state.nodeObject.status.nodeInfo.containerRuntimeVersion }}
            </span>
          </el-form-item>
          <el-form-item label="kubelet版本" class="detail-card-style-form">
            <span class="detail-card-style-form2" style="margin-left: 45px">
              {{ state.nodeObject.status.nodeInfo.kubeletVersion }}
            </span>
          </el-form-item>
          <el-form-item label="kubeProxy版本" class="detail-card-style-form">
            <span class="detail-card-style-form2" style="margin-left: 26px">
              {{ state.nodeObject.status.nodeInfo.kubeProxyVersion }}
            </span>
          </el-form-item>
          <el-form-item label="podCIDRs" class="detail-card-style-form">
            <span class="detail-card-style-form2" style="margin-left: 55px">
              {{ state.nodeObject.spec.podCIDR }}
            </span>
          </el-form-item>
        </div>
      </el-card> -->
    </div>
  </div>
</template>

<script setup lang="jsx">
import { reactive, getCurrentInstance, onMounted, ref } from 'vue';
import jsYaml from 'js-yaml';
import { getNode } from '@/services/kubernetes/nodeService';
import { getPodsByNode } from '@/services/kubernetes/podService';
import { getTableData } from '@/utils/utils';
import { formatterTime } from '@/utils/formatter';
import Pagination from '@/components/pagination/index.vue';
import MyCodeMirror from '@/components/codemirror/index.vue';
import { getRawEventList, deleteEvent } from '@/services/kubernetes/eventService';

const { proxy } = getCurrentInstance();

const data = reactive({
  loading: false,

  name: '',
  clusterName: '',
  cluster: '',

  pageInfo: {
    page: 1,
    total: 0,
    limit: 10,
    search: {
      field: 'name',
      searchInfo: '',
    },
  },

  pageEventInfo: {
    page: 1,
    limit: 10,
    total: 0,
    search: {
      field: 'name',
      searchInfo: '',
    },
  },

  nodeObject: '',

  crontab: false,
  nodePods: [],
  nodeEvents: [],

  nodeImages: [],

  tableData: [],
  eventTableData: [],

  activeName: 'second',

  yaml: '',
  yamlName: '',
  readOnly: true,
});

onMounted(async () => {
  data.cluster = proxy.$route.query.cluster;
  data.clusterName = localStorage.getItem(data.cluster);
  data.name = proxy.$route.query.name;

  await getNodeObject();

  getNodePods();
  getNodeEvents();
});

const getNodeObject = async () => {
  data.loading = true;
  const [result, err] = await getNode(data.cluster, data.name);
  data.loading = false;
  if (err) {
    proxy.$notify.error({ title: 'Node', message: err.response.data.message });
    return;
  }
  data.nodeObject = result;
  data.yaml = jsYaml.dump(data.nodeObject, { quotingType: '"' });

  if (data.nodeObject.status.images !== undefined) {
    for (let image of data.nodeObject.status.images) {
    }
  }
};

const formatterName = (row, column, cellValue) => {
  return (
    <el-tooltip effect="light" placement="top" content={cellValue}>
      <div class="pixiu-ellipsis-style">{cellValue}</div>
    </el-tooltip>
  );
};

const getNodePods = async () => {
  const [result, err] = await getPodsByNode(data.cluster, data.name);
  if (err) {
    proxy.$notify.error({ title: 'Node', message: err.response.data.message });
    return;
  }
  data.nodePods = result.items;
  data.pageInfo.total = result.items.length;
  data.tableData = getTableData(data.pageInfo, data.nodePods);
};

const searchPods = async () => {
  let allSearchedPods = [];
  if (data.pageInfo.search.field === 'name') {
    for (let pod of data.nodePods) {
      if (pod.metadata.name.search(data.pageInfo.search.searchInfo) !== -1) {
        allSearchedPods.push(pod);
      }
    }
  }

  data.pageInfo.total = allSearchedPods.length;
  data.tableData = getTableData(data.pageInfo, allSearchedPods);
};

const getNodeEvents = async () => {
  data.loading = true;
  const [result, err] = await getRawEventList(
    data.cluster,
    data.nodeObject.metadata.name,
    '',
    data.nodeObject.metadata.name,
    'Node',
    false,
  );
  data.loading = false;
  if (err) {
    proxy.$notify.error({ title: 'Event', message: err.response.data.message });
    return;
  }

  data.nodeEvents = result;
  data.pageEventInfo.total = result.length;
  data.eventTableData = getTableData(data.pageEventInfo, data.nodeEvents);
};

const onChange = (v) => {
  data.pageInfo.limit = v.limit;
  data.pageInfo.page = v.page;
  data.tableData = getTableData(data.pageInfo, data.nodePods);
};

const onEventChange = (v) => {
  data.pageEventInfo.limit = v.limit;
  data.pageEventInfo.page = v.page;

  data.eventTableData = getTableData(data.pageEventInfo, data.nodeEvents);
};

const formatterStatus = (row, column, cellValue) => {
  let phase = cellValue.phase;
  if (phase == 'Failed') {
    phase = cellValue.reason;
  } else if (phase == 'Pending') {
    return <div class="color-yellow-word">{phase}</div>;
  }

  if (phase == 'Running') {
    return <div class="color-green-word">{phase}</div>;
  }
  return <div>{phase}</div>;
};

const getPodRestartCount = (row, column, status) => {
  let count = 0;
  // status.containerStatuses.forEach((item) => {
  //   count += item.restartCount;
  // });
  return <div>{count} 次</div>;
};

const handleClick = (tab, event) => {};
const handleChange = (name) => {};

const confirm = () => {
  data.readOnly = true;
};

const cancel = () => {
  data.readOnly = true;
};

const editYaml = () => {
  data.readOnly = false;
};

const goToNode = () => {
  proxy.$router.push({
    name: 'Node',
    query: { cluster: data.cluster },
  });
};
</script>

<style scoped="scoped"></style>
