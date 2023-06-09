import axios from 'axios'
import { getToken } from '@/utils/auth'
import qs from 'qs'
import { ElNotification } from 'element-plus'
//axios默认content-type设为json，字符集设为utf-8
axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'

//创建axios实例
const request = axios.create({
  //设置URL公共部分
  baseURL: import.meta.env.VITE_BASE_URL,
  //设置请求超时时间
  timeout: 10000
})

request.interceptors.request.use(
  (config) => {
    const needToken = config.headers?.isFetchToken === false
    if (getToken() && needToken) {
      // header中添加token
      config.headers['Authorization'] = 'Bearer ' + getToken()
    }
    if (config.method === 'get') {
      const url = config.url + '?' + qs.stringify(config.params)
      config.params = {}
      config.url = url
    }
    return config
  },
  (error) => {
    Promise.reject(error).catch(()=>{
      ElNotification({
        title: '出错了QAQ',
        message: '系统错误，请稍后再试',
        type: 'error'
      })
    })
  }
)

request.interceptors.response.use(
  (res) => {
    const code: string = res.data.code + ''
    const msg: string = res.data.msg || '系统未知错误，请反馈给管理员'
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res.data
    }
    if (code === '0') {
      ElNotification({
        title: '请求成功！',
        message: res.data.msg || '请求成功啦！',
        type: 'success'
      })
    }
    if (code !== '0') {
      ElNotification({
        title: '出错了QAQ',
        message: msg,
        type: 'error'
      })
    }
    return Promise.resolve(res.data)
  },
  (error) => {
    Promise.reject(error).catch(()=>{
      ElNotification({
        title: '出错了QAQ',
        message: '系统错误，请稍后再试',
        type: 'error'
      })
    })
  }
)

export default request
