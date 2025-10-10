'use client';

import { NodeDetail } from '@/assets/type';
import DocFab from '@/components/docFab';
import { DocWidth } from '@/constant';
import useCopy from '@/hooks/useCopy';
import { useStore } from '@/provider';
import { ConstsCopySetting } from '@/request/types';
import { TocList, useTiptap } from '@ctzhian/tiptap';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box, Fab, Skeleton, Zoom } from '@mui/material';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import DocAnchor from './DocAnchor';
import DocContent from './DocContent';

const Doc = ({ node }: { node?: NodeDetail }) => {
  const { kbDetail, mobile, catalogWidth } = useStore();
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState<TocList>([]);
  const [characterCount, setCharacterCount] = useState(0);
  const params = useParams() || {};
  const docId = params.id as string;
  const editorRef = useTiptap({
    content: node?.content || '',
    editable: false,
    immediatelyRender: false,
    onTocUpdate: (toc: TocList) => {
      setHeadings(toc);
    },
    onBeforeCreate: () => {
      setLoading(true);
    },
    onCreate: ({ editor }) => {
      setLoading(false);
      setCharacterCount((editor.storage as any).characterCount.characters());
    },
  });

  const docWidth = useMemo(() => {
    return kbDetail?.settings?.theme_and_style?.doc_width || 'full';
  }, [kbDetail]);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useCopy({
    mode:
      kbDetail?.settings?.copy_setting !== ConstsCopySetting.CopySettingDisabled
        ? 'allow'
        : 'disable',
    blockContextMenuWhenDisabled: false,
    suffix:
      kbDetail?.settings?.copy_setting === ConstsCopySetting.CopySettingAppend
        ? `\n\n-----------------------------------------\n内容来自 ${typeof window !== 'undefined' ? window.location.href : ''}`
        : '',
  });

  const handleScroll = () => {
    setShowScrollTop(
      document.querySelector('#scroll-container')!.scrollTop > 300,
    );
  };

  useEffect(() => {
    document
      .querySelector('#scroll-container')
      ?.addEventListener('scroll', handleScroll);
    return () =>
      document
        .querySelector('#scroll-container')
        ?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    document
      .querySelector('#scroll-container')
      ?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (node && editorRef && editorRef.editor) {
      requestAnimationFrame(() => {
        editorRef.editor.commands.setContent(node?.content || '');
      });
    }
  }, [node]);

  return (
    <>
      {loading ? (
        <Box
          sx={{
            ...(docWidth === 'full' &&
              !mobile && {
                flexGrow: 1,
              }),
            ...(docWidth !== 'full' &&
              !mobile && {
                width: DocWidth[docWidth as keyof typeof DocWidth].value,
                maxWidth: `calc(100% - ${catalogWidth}px - 265px - 192px)`,
              }),
            ...(mobile && {
              mx: 'auto',
              marginTop: 3,
              width: '100%',
              px: 3,
            }),
          }}
        >
          <Skeleton
            variant='rounded'
            width={'70%'}
            height={36}
            sx={{ mb: '10px' }}
          />
          <Skeleton
            variant='rounded'
            width={'50%'}
            height={20}
            sx={{ mb: 4 }}
          />
          <Box
            sx={{
              mb: 6,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '10px',
              bgcolor: 'background.paper3',
              p: '20px',
              fontSize: 14,
              lineHeight: '28px',
              backdropFilter: 'blur(5px)',
            }}
          >
            <Box sx={{ fontWeight: 'bold', mb: 2, lineHeight: '22px' }}>
              内容摘要
            </Box>
            <Skeleton variant='rounded' height={16} sx={{ mb: 1 }} />
            <Skeleton variant='rounded' width={'30%'} height={16} />
          </Box>
          <Skeleton
            variant='rounded'
            width={'20%'}
            height={36}
            sx={{ m: '40px 0 20px' }}
          />
          <Skeleton variant='rounded' height={16} sx={{ mb: 1 }} />
          <Skeleton variant='rounded' height={16} sx={{ mb: 1 }} />
          <Skeleton
            variant='rounded'
            width={'70%'}
            height={16}
            sx={{ mb: 2 }}
          />
          <Skeleton variant='rounded' height={16} sx={{ mb: 1 }} />
          <Skeleton variant='rounded' height={16} sx={{ mb: 1 }} />
          <Skeleton
            variant='rounded'
            width={'90%'}
            height={16}
            sx={{ mb: 1 }}
          />
          <Skeleton
            variant='rounded'
            width={'35%'}
            height={36}
            sx={{ m: '40px 0 20px' }}
          />
          <Skeleton variant='rounded' height={16} sx={{ mb: 1 }} />
          <Skeleton variant='rounded' height={16} sx={{ mb: 1 }} />
          <Skeleton variant='rounded' height={16} sx={{ mb: 1 }} />
        </Box>
      ) : (
        <DocContent
          info={node}
          docWidth={docWidth}
          editorRef={editorRef}
          characterCount={characterCount}
        />
      )}

      {!mobile && <DocAnchor headings={headings} />}

      <DocFab />

      {!mobile && (
        <Zoom in={showScrollTop}>
          <Fab
            size='small'
            onClick={scrollToTop}
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 16,
              zIndex: 10000,
              backgroundColor: 'background.paper3',
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'background.paper2',
              },
            }}
          >
            <KeyboardArrowUpIcon sx={{ fontSize: 24 }} />
          </Fab>
        </Zoom>
      )}
    </>
  );
};

export default Doc;
