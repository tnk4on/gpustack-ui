export default {
  'resources.title': 'Resources',
  'resources.nodes': 'Nodes',
  'resources.button.create': 'Add Worker',
  'resources.button.edit': 'Edit Worker',
  'resources.button.edittags': 'Edit Labels',
  'resources.button.update': 'Update Labels',
  'resources.table.labels': 'Labels',
  'resources.table.hostname': 'Hostname',
  'resources.table.key.tips': 'The same key exists.',
  'resources.form.label': 'Label',
  'resources.form.advanced': 'Advanced',
  'resources.form.enablePartialOffload': 'Allow CPU Offloading',
  'resources.form.placementStrategy': 'Placement Strategy',
  'resources.form.workerSelector': 'Worker Selector',
  'resources.form.enableDistributedInferenceAcrossWorkers':
    'Allow Distributed Inference Across Workers',
  'resources.form.spread.tips':
    'Make the resources of the entire cluster relatively evenly distributed among all workers. It may produce more resource fragmentation on a single worker.',
  'resources.form.binpack.tips':
    'Prioritize the overall utilization of cluster resources, reducing resource fragmentation on Workers/GPUs.',
  'resources.form.workerSelector.description':
    'The system selects the most suitable GPU or Worker for deploying model instances based on predefined labels.',
  'resources.table.ip': 'IP',
  'resources.table.cpu': 'CPU',
  'resources.table.memory': 'RAM',
  'resources.table.gpu': 'GPU',
  'resources.table.disk': 'Storage',
  'resources.table.vram': 'VRAM',
  'resources.table.index': 'Index',
  'resources.table.workername': 'Worker Name',
  'resources.table.vender': 'Vendor',
  'resources.table.temperature': 'Temperature',
  'resources.table.core': 'Cores',
  'resources.table.utilization': 'Utilization',
  'resources.table.gpuutilization': 'GPU Utilization',
  'resources.table.vramutilization': 'VRAM Utilization',
  'resources.table.total': 'Total',
  'resources.table.used': 'Used',
  'resources.table.allocated': 'Allocated',
  'resources.table.wokers': 'workers',
  'resources.worker.linuxormaxos': 'Linux or MacOS',
  'resources.table.unified': 'Unified Memory',
  'resources.worker.add.step1':
    'Get Token <span class="note-text">(Run on the server)</span>',
  'resources.worker.add.step2': 'Register Worker',
  'resources.worker.add.step2.tips':
    'Note: run on the worker to be added, <span style="color: #000;font-weight: 600">mytoken</span> is the token obtained in the first step.',
  'resources.worker.add.step3':
    'After success, refresh the workers list to see the new worker.',
  'resources.worker.container.supported': 'Do not support MacOS or Windows.',
  'resources.worker.current.version': 'Current version is {version}.',
  'resources.worker.driver.install':
    'Ensure all necessary drivers and libraries are installed on the system prior to installing GPUStack.',
  'resources.worker.select.command':
    'Select a label to generate the command and copy it using the copy button.',
  'resources.worker.script.install': 'Script Installation',
  'resources.worker.container.install': 'Container Installation(Linux Only)',
  'resources.worker.cann.tips': `Set <span style='color: #000;font-weight: 600'>ASCEND_VISIBLE_DEVICES</span> to the required GPU indices. For GPU0 to GPU3, use <span style='color: #000;font-weight: 600'>ASCEND_VISIBLE_DEVICES=0,1,2,3</span> or <span style='color: #000;font-weight: 600'>ASCEND_VISIBLE_DEVICES=0-3</span>.`,
  'resources.modelfiles.form.path': 'Storage path',
  'resources.modelfiles.modelfile': 'Model Files',
  'resources.modelfiles.download': 'Add Model File',
  'resources.modelfiles.size': 'Size',
  'resources.modelfiles.selecttarget': 'Select Target',
  'resources.modelfiles.form.localdir': 'Local Directory',
  'resources.modelfiles.form.localdir.tips':
    'The default storage directory is <span class="desc-block">/var/lib/gpustack/cache</span> or the directory specified with <span class="desc-block">--data-dir</span>.',
  'resources.modelfiles.retry.download': 'Retry Download',
  'resources.modelfiles.storagePath.holder':
    'Waiting for download to complete...',
  'resources.filter.worker': 'Filter by Worker',
  'resources.filter.source': 'Filter by Source',
  'resources.modelfiles.delete.tips': 'Also delete the file from disk!'
};
