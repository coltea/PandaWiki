import { createNode, ImportDocListItem, ImportDocProps, scrapeCrawler, uploadFile } from "@/api"
import Upload from "@/components/UploadFile/Drag"
import { useAppSelector } from "@/store"
import { formatByte } from "@/utils"
import { Close } from "@mui/icons-material"
import { Box, Button, Checkbox, CircularProgress, IconButton, LinearProgress, List, ListItem, ListItemText, Skeleton, Stack, Typography } from "@mui/material"
import { Ellipsis, Icon, Message, Modal } from "ct-mui"
import { useState } from "react"
import { FileRejection } from "react-dropzone"

const StepText = {
  'pull': {
    okText: '拉取数据',
    showCancel: true,
  },
  'pull-done': {
    okText: '拉取数据',
    showCancel: true,
  },
  'import': {
    okText: '导入数据',
    showCancel: true,
  },
  'done': {
    okText: '完成',
    showCancel: false,
  }
}

const OfflineFileImport = ({ open, refresh, onCancel, parentId = null, size: defaultSize }: ImportDocProps) => {

  const { kb_id } = useAppSelector(state => state.config)
  const [step, setStep] = useState<keyof typeof StepText>('pull')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<ImportDocListItem[]>([])
  const [selectIds, setSelectIds] = useState<string[]>([])
  const [isCancelled, setIsCancelled] = useState(false)

  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([])
  const [rejectedFiles, setRejectedFiles] = useState<FileRejection[]>([])
  const [isUploading, setIsUploading] = useState(0)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)
  const size = 1024 * 1024 * (defaultSize || 20)

  const onChangeFile = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setAcceptedFiles(acceptedFiles)
    setRejectedFiles(rejectedFiles)
    setIsUploading(0)
  }

  const handleRemove = (index: number) => {
    const newFiles = acceptedFiles.filter((_, i) => i !== index)
    setAcceptedFiles(newFiles)
  }

  const handleCancel = () => {
    setIsCancelled(true)
    setStep('pull')
    setItems([])
    setSelectIds([])
    setAcceptedFiles([])
    setRejectedFiles([])
    setIsUploading(0)
    setCurrentFileIndex(0)
    setUploadProgress(0)
    setLoading(false)
    onCancel()
    refresh?.()
  }

  const getUrlByUploadFile = async (file: File, onProgress: (progress: number) => void) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("kb_id", kb_id)
    const response = await uploadFile(formData, {
      onUploadProgress: (event) => onProgress(event.progress)
    })
    return '/static-file/' + response.key
  }

  const handleFile = async () => {
    if (isUploading === 1) return
    setIsUploading(1)
    setCurrentFileIndex(0)
    const urls: { url: string, title: string }[] = []
    const errorIdx: number[] = []
    try {
      for (let i = 0; i < acceptedFiles.length; i++) {
        setCurrentFileIndex(i)
        setUploadProgress(0)
        try {
          const url = await getUrlByUploadFile(acceptedFiles[i], (progress) => {
            setUploadProgress(progress)
          })
          urls.push({ url, title: acceptedFiles[i].name.split('.')[0] })
        } catch (error) {
          errorIdx.push(i)
          console.error(`文件 ${acceptedFiles[i].name} 上传失败:`, error)
        }
      }
      setStep('pull-done')
      setTimeout(async () => {
        for (const { url, title } of urls) {
          const res = await scrapeCrawler({ url, kb_id })
          setItems(prev => [{ ...res, url, title: title || res.title, success: -1, id: '' }, ...prev])
        }
        setStep('import')
        setLoading(false)
      }, 0)
    } catch (error) {
      console.error(error)
    }
  }

  const handleOk = async () => {
    if (step === 'done') {
      handleCancel()
      refresh?.()
    } else if (step === 'pull') {
      setLoading(true)
      setIsCancelled(false)
      handleFile()
    } else if (step === 'import') {
      if (selectIds.length === 0) {
        Message.error('请选择要导入的文档')
        return
      }
      setItems(prev => prev.map(item => ({ ...item, success: 0 })))
      const newItems = [...items]
      for (const url of selectIds) {
        try {
          const curItem = items.find(item => item.url === url)
          if (!curItem || (curItem.id !== '' && curItem.id !== '-1')) {
            continue
          }
          const res = await createNode({
            name: curItem?.title || '',
            content: curItem?.content || '',
            parent_id: parentId,
            type: 2,
            kb_id
          })
          const index = newItems.findIndex(item => item.url === url)
          if (index !== -1) {
            Message.success(newItems[index].title + '导入成功')
            newItems[index] = {
              ...newItems[index],
              success: 1,
              id: res.id
            }
          }
        } catch (error) {
          const index = newItems.findIndex(item => item.url === url)
          if (index !== -1) {
            Message.error(newItems[index].title + '导入失败')
            newItems[index] = {
              ...newItems[index],
              success: 1,
              id: '-1'
            }
          }
        }
      }
      const allSuccess = newItems.every(item => item.success === 1 && item.id !== '-1' && item.id !== '')
      setItems(newItems)
      if (allSuccess) {
        setStep('done')
      }
    }
  }

  return <Modal
    title={`通过离线文件导入`}
    open={open}
    onCancel={handleCancel}
    onOk={handleOk}
    disableEscapeKeyDown
    okText={StepText[step].okText}
    showCancel={StepText[step].showCancel}
    okButtonProps={{ loading }}
  >
    {step === 'pull' && <Box>
      <Upload
        file={acceptedFiles}
        onChange={(accept, reject) => onChangeFile(accept, reject)}
        type='drag'
        multiple={true}
        accept={'.txt, .md, .xls, .xlsx, .docx, .pdf, .html, .pptx'}
        size={size}
      />
      {isUploading === 1 && <Box sx={{ mt: 2 }}>
        <Box sx={{ fontSize: 14, mb: 1 }}>
          正在上传文件 {currentFileIndex + 1} / {acceptedFiles.length}
        </Box>
        <Stack direction='row' alignItems={'center'} justifyContent={'space-between'} gap={2}>
          <Box sx={{ fontSize: 12 }}>
            {acceptedFiles[currentFileIndex]?.name}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <CircularProgress size={16} sx={{ mr: 1.5 }} />
            <Typography variant="body2">{uploadProgress}%</Typography>
          </Box>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={uploadProgress}
          sx={{
            height: '4px !important',
            borderRadius: 4,
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
            },
          }}
        />
      </Box>}
      {(acceptedFiles.length > 0 || rejectedFiles.length > 0) && (
        <Box sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
          <List dense>
            {acceptedFiles.map((file, index) => {
              return <ListItem
                key={`${file.name}-${index}`}
                sx={{
                  borderBottom: '1px dashed',
                  borderColor: 'divider',
                  ':hover': {
                    backgroundColor: 'background.paper2'
                  }
                }}
                secondaryAction={
                  isUploading === 2 ? <Box sx={{ color: 'error.main', fontSize: 12 }}>上传失败</Box>
                    : <IconButton edge='end' onClick={() => handleRemove(index)}>
                      <Close sx={{ fontSize: 14 }} />
                    </IconButton>
                }
              >
                <ListItemText
                  primary={file.name}
                  secondary={formatByte(file.size)}
                />
                {size && file.size > size && (
                  <Typography variant='caption' color='error' sx={{ ml: 2, fontSize: 12 }}>
                    超过大小限制
                  </Typography>
                )}
              </ListItem>
            })}
          </List>
        </Box>
      )}
    </Box>}
    {step !== 'pull' && <Box sx={{
      borderRadius: '10px',
      border: '1px solid',
      borderColor: 'divider',
      maxHeight: 'calc(100vh - 300px)',
      overflowX: 'hidden',
      overflowY: 'auto',
    }}>
      {['pull-done', 'import'].includes(step) && <Stack direction={'row'} alignItems={'center'} gap={1} sx={{
        px: 2,
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <Checkbox
          size="small"
          sx={{ flexShrink: 0, p: 0, m: 0 }}
          checked={selectIds.length === items.length}
          onChange={() => {
            if (selectIds.length === items.length) {
              setSelectIds([])
            } else {
              setSelectIds(items.map(item => item.url))
            }
          }}
        />
        <Box sx={{ fontSize: 14 }}>全选</Box>
      </Stack>}
      <Stack>
        {loading && <Stack direction={'row'} alignItems={'center'} gap={1} sx={{
          px: 2,
          py: 1,
          cursor: 'pointer',
          bgcolor: 'background.paper2'
        }}>
          <Stack direction={'row'} justifyContent={'center'} alignItems={'center'} sx={{ flexShrink: 0, width: 20, height: 20 }}>
            <Icon type='icon-shuaxin' sx={{ fontSize: 18, color: 'text.auxiliary', animation: 'loadingRotate 1s linear infinite' }} />
          </Stack>
          <Box component="label" sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width={200} height={21} />
            <Skeleton variant="text" height={18} />
          </Box>
        </Stack>}
        {items.map((item, idx) => <Stack direction={'row'} alignItems={'center'} gap={1} key={item.url} sx={{
          px: 2,
          py: 1,
          cursor: 'pointer',
          borderBottom: idx === items.length - 1 ? 'none' : '1px solid',
          borderColor: 'divider',
          ':hover': {
            bgcolor: 'background.paper2'
          }
        }}>
          {item.success === 0 ?
            <Icon type='icon-shuaxin' sx={{ fontSize: 18, color: 'text.auxiliary', animation: 'loadingRotate 1s linear infinite' }} />
            : item.id === '' ? <Checkbox
              size="small"
              id={item.url}
              sx={{ flexShrink: 0, p: 0, m: 0 }}
              checked={selectIds.includes(item.url)}
              onChange={() => {
                setSelectIds(prev => {
                  if (prev.includes(item.url)) {
                    return prev.filter(it => it !== item.url)
                  }
                  return [...prev, item.url]
                })
              }}
            /> : <Stack direction={'row'} justifyContent={'center'} alignItems={'center'} sx={{ flexShrink: 0, width: 20, height: 20 }}>
              {item.id === '-1' ? <Icon type='icon-icon_tool_close' sx={{ fontSize: 18, color: 'error.main' }} />
                : <Icon type='icon-duihao' sx={{ fontSize: 18, color: 'success.main' }} />}
            </Stack>}
          <Box component="label" sx={{ flexGrow: 1, cursor: 'pointer', width: 0 }} htmlFor={item.url}>
            <Ellipsis sx={{ fontSize: 14 }}>{item.title || item.url}</Ellipsis>
            {item.content && <Ellipsis sx={{ fontSize: 12, color: 'text.auxiliary' }}>{item.content}</Ellipsis>}
          </Box>
          {item.id === '-1' ? <Button size='small' variant='outlined' onClick={() => {
            setItems(prev => prev.map(it => it.url === item.url ? { ...it, success: 0, id: '' } : it))
            createNode({
              name: item.title,
              content: item.content,
              parent_id: parentId,
              type: 2,
              kb_id
            }).then(res => {
              Message.success(item.title + '导入成功')
              setItems(prev => prev.map(it => it.url === item.url ? { ...it, success: 1, id: res.id } : it))
            }).catch(() => {
              Message.error(item.title + '导入失败')
            })
          }}>重新导入</Button> : null}
        </Stack>)}
      </Stack>
    </Box>}
  </Modal>
}

export default OfflineFileImport 
