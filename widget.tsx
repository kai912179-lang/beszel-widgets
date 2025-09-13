import { Divider, fetch, Text, VStack, HStack, Circle, Spacer, Widget, Gauge } from "scripting"

export interface IBeszelConfig {
  beszelURL: string
  apiToken: string
  serverName: string
}
interface ISystemItem {
  collectionId: string
  collectionName: string
  created: string
  host: string
  id: string
  info: {
    h: string
    k: string
    c: number  // CPU cores
    t: number
    m: string
    u: number // uptime in seconds
    cpu: number // CPU percentage
    mp: number // memory percentage
    dp: number // disk percentage
    b: number
    v: string
    dt: number // server temperature
    os: number
    bb: number
    la: [
      number,
      number,
      0
    ]
  },
  name: string,
  port: string,
  status: string,
  updated: string,
  users: string[]
}
interface ISystemRecord {
  items: ISystemItem[],
  page: number,
  perPage: number,
  totalItems: number,
  totalPages: number

}
export interface ServerStatus {
  name?: string // 服务器名称
  status?: string // 服务器状态
  uptime?: string // 运行时间
  load?: string // 负载
  memoryUsage?: string // 内存使用率
  memoryPercent?: number // 内存使用百分比
  diskUsage?: string // 磁盘使用率
  diskPercent?: number // 磁盘使用百分比
  temperature?: number // 温度
  cpuPercent?: number // CPU使用率
  readSpeed?: string // 读取速度
  writeSpeed?: string // 写入速度
}
function getServerStatus(beszelConfig: IBeszelConfig): Promise<ServerStatus> {
  console.log('=== getServerStatus called with config ===', beszelConfig)
  const url = beszelConfig.beszelURL + `/api/collections/systems/records?filter=(name='${beszelConfig.serverName}')`
  console.log('=== API URL ===', url)

  return fetch(url, {
    headers: {
      'Authorization': `Bearer ${beszelConfig.apiToken}`
    }
  }).then(res => {
    console.log('=== fetch response ===', res.ok, res.status, res.statusText)

    if (!res.ok) {
      throw new Error(`Failed to fetch server status: ${res.status} ${res.statusText}`)
    }
    return res.json()
  }).then(data => {
    console.log('=== API response data ===', data)
    const typedData = data as ISystemRecord

    if (typedData.totalItems === 0) {
      throw new Error(`No server found with name: ${beszelConfig.serverName}`)
    }
    const item = typedData.items[0]
    console.log('=== First item ===', item)

    const dataFormatted = {
      name: item.name,
      status: item.status,
      uptime: (() => {
        const totalSeconds = item.info.u
        const days = Math.floor(totalSeconds / 86400) // 86400 = 24 * 60 * 60
        const hours = Math.floor((totalSeconds % 86400) / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        
        if (days > 0) {
          return `${days}d`
        } else {
          return `${hours}h ${minutes}m`
        }
      })(),
      load: item.info.la.map(n => n.toFixed(2)).join(', '),
      memoryUsage: `${item.info.mp}%`,
      memoryPercent: item.info.mp,
      diskUsage: `${item.info.dp}%`,
      diskPercent: item.info.dp,
      temperature: item.info.dt,
      cpuPercent: item.info.cpu,
      readSpeed: `${(item.info.b / 1024).toFixed(1)}K`,
      writeSpeed: `${(item.info.bb / 1024).toFixed(1)}K`
    }
    return dataFormatted
  })
}
console.log('=== Script started ===')

const widgetConfig = Widget.parameter ? JSON.parse(Widget.parameter) as IBeszelConfig : null
let serverData: ServerStatus | null = null
let errorMessage: string | null = null
let isLoading = true

function WidgetView() {
  console.log('=== WidgetView function started ===')
  console.log('=== Current state ===', { isLoading, serverData, errorMessage })

  if (!widgetConfig) {
    console.log('Widget not configured')
    return <VStack
      padding
      frame={Widget.displaySize}
      background='systemRed'
      foregroundStyle="white"
    >
      <Text>Please configure the widget</Text>
    </VStack>
  }

  if (isLoading && !serverData && !errorMessage) {
    return <VStack
      padding
      frame={Widget.displaySize}
      background='black'
      spacing={8}
      alignment="center"
    >
      <Circle
        frame={{ width: 16, height: 16 }}
        foregroundStyle='systemBlue'
      />
      <VStack spacing={4} alignment="center">
        <Text 
          font="title3" 
          fontWeight="semibold"
          foregroundStyle="white"
        >
          {widgetConfig.serverName}
        </Text>
        <Text 
          font="caption" 
          foregroundStyle="secondaryLabel"
        >
          正在加载...
        </Text>
      </VStack>
      <Spacer />
      <Text font="caption2" foregroundStyle="tertiaryLabel">
        {new Date().toLocaleTimeString()}
      </Text>
    </VStack>
  }

  if (errorMessage) {
    return <VStack
      padding
      frame={Widget.displaySize}
      background='black'
      spacing={8}
      alignment="center"
    >
      <Circle
        frame={{ width: 16, height: 16 }}
        foregroundStyle='systemRed'
      />
      <VStack spacing={4} alignment="center">
        <Text 
          font="title3" 
          fontWeight="semibold"
          foregroundStyle="systemRed"
        >
          连接失败
        </Text>
        <Text 
          font="caption" 
          foregroundStyle="secondaryLabel"
          multilineTextAlignment="center"
        >
          {errorMessage}
        </Text>
      </VStack>
      <Spacer />
      <HStack>
        <Text font="caption2" foregroundStyle="tertiaryLabel">
          {new Date().toLocaleTimeString()}
        </Text>
        <Spacer />
        <Text font="caption2" foregroundStyle="tertiaryLabel">
          RealTONG
        </Text>
      </HStack>
    </VStack>
  }

  return <VStack
    padding
    frame={Widget.displaySize}
    background='black'
    spacing={10}
  >
    {/* 顶部标题栏 */}
    <HStack alignment="center">
      <Text 
        font="title2" 
        fontWeight="semibold"
        foregroundStyle="white"
      >
        {serverData?.name || 'Server'}
      </Text>
      <Spacer />
      <Text 
        font="title3" 
        fontWeight="medium"
        foregroundStyle="white"
      >
        {serverData?.temperature || '--'}°C
      </Text>
      <Circle
        frame={{ width: 8, height: 8 }}
        foregroundStyle={serverData?.status === 'up' ? 'systemGreen' : 'systemRed'}
      />
    </HStack>

    {/* Uptime 信息 */}
    <HStack alignment="center">
      <Text 
        font="caption" 
        foregroundStyle="secondaryLabel"
      >
        运行时间
      </Text>
      <Spacer />
      <Text 
        font="caption" 
        fontWeight="medium"
        foregroundStyle="systemGreen"
      >
        {serverData?.uptime || '--'}
      </Text>
    </HStack>

    {/* 圆形进度条区域 */}
    <HStack spacing={16} alignment="center">
      {/* 负载进度条 */}
      <VStack spacing={8} alignment="center">
        <Gauge
          value={(serverData?.cpuPercent || 0) / 100}
          min={0}
          max={1}
          gaugeStyle={"accessoryCircular"}
          label={<Text font="caption" foregroundStyle="white">Load</Text>}
          currentValueLabel={<Text font="caption2" foregroundStyle="systemGreen">{(serverData?.cpuPercent || 0).toFixed(1)}%</Text>}
        />
      </VStack>

      {/* 内存进度条 */}
      <VStack spacing={8} alignment="center">
        <Gauge
          value={(serverData?.memoryPercent || 0) / 100}
          min={0}
          max={1}
          gaugeStyle={"accessoryCircular"}
          label={<Text font="caption" foregroundStyle="white">Mem</Text>}
          currentValueLabel={<Text font="caption2" foregroundStyle="systemGreen">{(serverData?.memoryPercent || 0).toFixed(0)}%</Text>}
        />
      </VStack>

      {/* 磁盘进度条 */}
      <VStack spacing={8} alignment="center">
        <Gauge
          value={(serverData?.diskPercent || 0) / 100}
          min={0}
          max={1}
          gaugeStyle={"accessoryCircular"}
          label={<Text font="caption" foregroundStyle="white">Disk</Text>}
          currentValueLabel={<Text font="caption2" foregroundStyle="systemGreen">{(serverData?.diskPercent || 0).toFixed(0)}%</Text>}
        />
      </VStack>
    </HStack>

    {/* 底部信息区域 */}
    <HStack spacing={16}>
      <VStack spacing={4} alignment="leading">
        <HStack spacing={4}>
          <Text font="caption2" foregroundStyle="systemGreen">⬇</Text>
          <Text font="caption2" foregroundStyle="white">{serverData?.readSpeed || '0 K'}</Text>
        </HStack>
        <Text font="caption2" foregroundStyle="secondaryLabel">read/s</Text>
      </VStack>

      <VStack spacing={4} alignment="leading">
        <HStack spacing={4}>
          <Text font="caption2" foregroundStyle="systemGreen">⬆</Text>
          <Text font="caption2" foregroundStyle="white">{serverData?.writeSpeed || '0 K'}</Text>
        </HStack>
        <Text font="caption2" foregroundStyle="secondaryLabel">write/s</Text>
      </VStack>

      <Spacer />

      <VStack spacing={4} alignment="trailing">
        <HStack spacing={4}>
          <Text font="caption2" foregroundStyle="white">0</Text>
          <Text font="caption2" foregroundStyle="white">B</Text>
        </HStack>
        <Text font="caption2" foregroundStyle="secondaryLabel">read/s</Text>
      </VStack>

      <VStack spacing={4} alignment="trailing">
        <HStack spacing={4}>
          <Text font="caption2" foregroundStyle="white">0</Text>
          <Text font="caption2" foregroundStyle="white">B</Text>
        </HStack>
        <Text font="caption2" foregroundStyle="secondaryLabel">write/s</Text>
      </VStack>
    </HStack>
  </VStack>
}

// 启动数据获取
if (widgetConfig) {
  console.log('=== Starting data fetch ===')
  getServerStatus(widgetConfig)
    .then(status => {
      console.log('=== Data loaded successfully ===', status)
      serverData = status
      isLoading = false
    })
    .catch(err => {
      console.error('=== Error loading data ===', err)
      errorMessage = err instanceof Error ? err.message : 'Unknown error'
      isLoading = false
    })
}

// 延迟展示小组件，给数据加载一些时间
setTimeout(() => {
  Widget.present(<WidgetView />, {
    policy: "after",
    date: new Date(Date.now() + 1000 * 5) // 5 秒后刷新
  })
}, 2000) // 等待2秒