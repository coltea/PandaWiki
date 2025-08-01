import { ImportDocProps, ImportDocType } from '@/api/type'
import ImportDocConfluence from './Confluence'
import ImportDocYuque from './Yuque'
import EpubImport from './Epub'
import FeishuImport from './Feishu'
import NotionImport from './Notion'
import OfflineFileImport from './OfflineFile'
import RSSImport from './RSS'
import SitemapImport from './Sitemap'
import URLImport from './URL'
import WikijsImport from './Wikijs'

const ImportDoc = ({ type, open, refresh, onCancel, parentId = null }: ImportDocProps & { type: ImportDocType }) => {
  switch (type) {
    case 'OfflineFile':
      return <OfflineFileImport size={100} open={open} refresh={refresh} onCancel={onCancel} parentId={parentId} />
    case 'URL':
      return <URLImport open={open} refresh={refresh} onCancel={onCancel} parentId={parentId} />
    case 'RSS':
      return <RSSImport open={open} refresh={refresh} onCancel={onCancel} parentId={parentId} />
    case 'Sitemap':
      return <SitemapImport open={open} refresh={refresh} onCancel={onCancel} parentId={parentId} />
    case 'Notion':
      return <NotionImport open={open} refresh={refresh} onCancel={onCancel} parentId={parentId} />
    case 'Epub':
      return <EpubImport size={100} open={open} refresh={refresh} onCancel={onCancel} parentId={parentId} />
    case 'Wiki.js':
      return <WikijsImport size={100} open={open} refresh={refresh} onCancel={onCancel} parentId={parentId} />
    case 'Yuque':
      return <ImportDocYuque size={100} open={open} refresh={refresh} onCancel={onCancel} parentId={parentId} />
    case 'Feishu':
      return <FeishuImport open={open} refresh={refresh} onCancel={onCancel} parentId={parentId} />
    case 'Confluence':
      return <ImportDocConfluence size={100}
        open={open} refresh={refresh} onCancel={onCancel} parentId={parentId} />
    default:
      return null
  }
}

export default ImportDoc
