import { useMemo, useState } from 'react'
import {
  AppBar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Link,
  Pagination,
  Paper,
  Snackbar,
  Stack,
  TextField,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  createTheme,
} from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DownloadIcon from '@mui/icons-material/Download'
import ImageSearchIcon from '@mui/icons-material/ImageSearch'
import PasteIcon from '@mui/icons-material/ContentPaste'
import SearchIcon from '@mui/icons-material/Search'
import { emotePath } from './data/emotes'
import { emoteSearchIndex } from './data/emoteSearchIndex'

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f7f8f5',
      paper: '#ffffff',
    },
    primary: {
      main: '#415D60',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d45d4f',
    },
    text: {
      primary: '#1e2528',
      secondary: '#5f7073',
    },
    divider: '#dfe4df',
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 800,
      lineHeight: 1.05,
      letterSpacing: 0,
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
      letterSpacing: 0,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
})

const normalize = (value) => value.toLowerCase().replace(/[\s_-]+/g, '')
const PAGE_SIZE = 24
const GIF_CLIPBOARD_NOTICE = '由于系统限制，不能复制 GIF 到剪切板中，请下载到本地使用'

function getAbsoluteUrl(fileName) {
  return new URL(emotePath(fileName), window.location.origin).toString()
}

function App() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')

  const filteredEmotes = useMemo(() => {
    const keyword = normalize(query.trim())

    if (!keyword) {
      return emoteSearchIndex
    }

    return emoteSearchIndex.filter((emote) => emote.searchText.includes(keyword))
  }, [query])

  const pageCount = Math.max(1, Math.ceil(filteredEmotes.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pagedEmotes = filteredEmotes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const displayedStart = filteredEmotes.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const displayedEnd = Math.min(currentPage * PAGE_SIZE, filteredEmotes.length)

  const copyEmote = async (emote) => {
    if (!navigator.clipboard?.writeText) {
      setToast('当前浏览器不支持复制')
      return
    }

    try {
      await navigator.clipboard.writeText(getAbsoluteUrl(emote.fileName))
      setToast(`已复制 ${emote.displayName} 链接。${GIF_CLIPBOARD_NOTICE}`)
    } catch {
      setToast('复制失败')
    }
  }

  const pasteSearch = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setQuery(text)
      setPage(1)
      setToast('已粘贴')
    } catch {
      setToast('浏览器没有开放剪贴板读取权限')
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar
          position="sticky"
          elevation={0}
          color="inherit"
          sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.92)' }}
        >
          <Toolbar sx={{ gap: 2, minHeight: 64 }}>
            <ImageSearchIcon color="primary" />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 800 }}>
              shenghuo2 的捏捏表情包
            </Typography>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: '#eef4ef',
          }}
        >
          <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
            <Stack spacing={2}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.25, md: 1.5 },
                  border: 1,
                  borderColor: 'divider',
                  maxWidth: 980,
                }}
              >
                <Stack spacing={1.25}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                  <TextField
                    fullWidth
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value)
                      setPage(1)
                    }}
                    placeholder="搜索"
                    size="small"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="粘贴">
                              <IconButton edge="end" onClick={pasteSearch} aria-label="粘贴">
                                <PasteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {query ? (
                              <Tooltip title="清空">
                                <IconButton
                                  edge="end"
                                  onClick={() => {
                                    setQuery('')
                                    setPage(1)
                                  }}
                                  aria-label="清空"
                                >
                                  <ClearIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {GIF_CLIPBOARD_NOTICE}
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: 'repeat(auto-fill, minmax(190px, 1fr))',
              },
              gap: { xs: 1.25, sm: 2 },
            }}
          >
            {pagedEmotes.map((emote) => (
              <Card key={emote.fileName} variant="outlined">
                <CardActionArea onClick={() => setSelected(emote)}>
                  <Box
                    sx={{
                      height: { xs: 118, sm: 160 },
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: '#f2f5f2',
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      component="img"
                      src={emotePath(emote.fileName)}
                      alt={emote.displayName}
                      loading="lazy"
                      sx={{ maxWidth: '100%', maxHeight: { xs: 104, sm: 144 }, objectFit: 'contain' }}
                    />
                  </Box>
                </CardActionArea>
                <CardContent sx={{ p: { xs: 1, sm: 1.5 } }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1fr) auto',
                      alignItems: 'center',
                      columnGap: 1,
                      width: '100%',
                    }}
                  >
                    <Typography fontWeight={800} noWrap title={emote.displayName} sx={{ minWidth: 0 }}>
                      {emote.displayName}
                    </Typography>
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end" sx={{ justifySelf: 'end' }}>
                      <Tooltip title="复制链接">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => copyEmote(emote)}
                          aria-label={`复制 ${emote.displayName} 链接`}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="下载">
                        <IconButton
                          color="primary"
                          component="a"
                          download={emote.fileName}
                          href={emotePath(emote.fileName)}
                          size="small"
                          onClick={(event) => event.stopPropagation()}
                          aria-label={`下载 ${emote.displayName}`}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Stack alignItems="center" spacing={1.25} sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              已展示 {displayedStart}-{displayedEnd} / 共 {filteredEmotes.length} 张
            </Typography>
            {pageCount > 1 ? (
              <Pagination
                color="primary"
                count={pageCount}
                page={currentPage}
                onChange={(_, value) => setPage(value)}
                showFirstButton
                showLastButton
                shape="rounded"
                variant="outlined"
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 1,
                    minWidth: 34,
                  },
                  '& .MuiPaginationItem-root.Mui-selected': {
                    bgcolor: 'primary.main',
                    borderColor: 'primary.main',
                    color: 'primary.contrastText',
                  },
                  '& .MuiPaginationItem-root.Mui-selected:hover': {
                    bgcolor: '#354c4f',
                    borderColor: '#354c4f',
                  },
                }}
              />
            ) : null}
          </Stack>
        </Container>

        <Container component="footer" maxWidth="xl" sx={{ mt: -1, pb: 1.5 }}>
          <Typography sx={{ color: '#aab3b4', fontSize: 11, lineHeight: 1.4 }}>
            © 使用{' '}
            <Link href="https://emotelab.app/" target="_blank" rel="noreferrer" sx={{ color: '#8d9b9d' }}>
              EmoteLab
            </Link>
            {' '}制作
          </Typography>
        </Container>

        <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
          {selected ? (
            <>
              <DialogTitle>{selected.displayName}</DialogTitle>
              <DialogContent>
                <Box
                  sx={{
                    minHeight: 260,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: '#f2f5f2',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Box
                    component="img"
                    src={emotePath(selected.fileName)}
                    alt={selected.displayName}
                    sx={{ maxWidth: '100%', maxHeight: 360, objectFit: 'contain' }}
                  />
                </Box>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button startIcon={<ContentCopyIcon />} onClick={() => copyEmote(selected)}>
                  复制链接
                </Button>
                <Button
                  component="a"
                  download={selected.fileName}
                  href={emotePath(selected.fileName)}
                  variant="contained"
                  startIcon={<DownloadIcon />}
                >
                  下载
                </Button>
              </DialogActions>
            </>
          ) : null}
        </Dialog>

        <Snackbar
          open={Boolean(toast)}
          autoHideDuration={1800}
          onClose={() => setToast('')}
          message={toast}
        />
      </Box>
    </ThemeProvider>
  )
}

export default App
