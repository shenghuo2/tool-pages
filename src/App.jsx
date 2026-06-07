import { useMemo, useState } from 'react'
import {
  AppBar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  ThemeProvider,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
  Typography,
  createTheme,
} from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DownloadIcon from '@mui/icons-material/Download'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import ImageSearchIcon from '@mui/icons-material/ImageSearch'
import LinkIcon from '@mui/icons-material/Link'
import PasteIcon from '@mui/icons-material/ContentPaste'
import SearchIcon from '@mui/icons-material/Search'
import TableRowsIcon from '@mui/icons-material/TableRows'
import { emotePath, emotes } from './data/emotes'

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f7f8f5',
      paper: '#ffffff',
    },
    primary: {
      main: '#176b66',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d45d4f',
    },
    text: {
      primary: '#1e2528',
      secondary: '#667072',
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
    h2: {
      fontSize: '1.5rem',
      fontWeight: 800,
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

function getAbsoluteUrl(fileName) {
  return new URL(emotePath(fileName), window.location.origin).toString()
}

function getCopyText(emote, format) {
  const url = getAbsoluteUrl(emote.fileName)

  if (format === 'markdown') {
    return `![${emote.englishName}](${url})`
  }

  if (format === 'filename') {
    return emote.fileName
  }

  return url
}

function App() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('gallery')
  const [copyFormat, setCopyFormat] = useState('url')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')

  const filteredEmotes = useMemo(() => {
    const keyword = query.trim().toLowerCase()

    if (!keyword) {
      return emotes
    }

    return emotes.filter((emote) => {
      const haystack = [
        emote.originalName,
        emote.englishName,
        emote.fileName,
        emote.sourceFile,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(keyword)
    })
  }, [query])

  const copyEmote = async (emote, format = copyFormat) => {
    await navigator.clipboard.writeText(getCopyText(emote, format))
    setToast(`已复制 ${emote.englishName}`)
  }

  const pasteSearch = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setQuery(text)
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
            <Button
              component={Link}
              href="/emote-mapping.csv"
              underline="none"
              variant="outlined"
              startIcon={<DownloadIcon />}
            >
              映射表
            </Button>
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
          <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
            <Stack spacing={3}>
              <Stack spacing={1} sx={{ maxWidth: 820 }}>
                <Typography variant="h1">shenghuo2 的捏捏表情包</Typography>
                <Typography color="text.secondary" sx={{ fontSize: { xs: 16, md: 18 } }}>
                  {emotes.length} 个 GIF
                </Typography>
              </Stack>

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.5, md: 2 },
                  border: 1,
                  borderColor: 'divider',
                  maxWidth: 980,
                }}
              >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                  <TextField
                    fullWidth
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="搜索中文名、英文名或文件名"
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
                                <IconButton edge="end" onClick={() => setQuery('')} aria-label="清空">
                                  <ClearIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={copyFormat}
                    onChange={(_, value) => value && setCopyFormat(value)}
                    aria-label="复制格式"
                    sx={{ flexShrink: 0 }}
                  >
                    <ToggleButton value="url" aria-label="URL">
                      <LinkIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="markdown" aria-label="Markdown">
                      <FileCopyIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="filename" aria-label="文件名">
                      <TableRowsIcon fontSize="small" />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
              </Paper>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3 }}>
            <Tab value="gallery" label="预览" icon={<ImageSearchIcon />} iconPosition="start" />
            <Tab value="mapping" label="映射" icon={<TableRowsIcon />} iconPosition="start" />
          </Tabs>

          {tab === 'gallery' ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                gap: 2,
              }}
            >
              {filteredEmotes.map((emote) => (
                <Card key={emote.fileName} variant="outlined">
                  <CardActionArea onClick={() => setSelected(emote)}>
                    <Box
                      sx={{
                        height: 160,
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
                        alt={emote.englishName}
                        loading="lazy"
                        sx={{ maxWidth: '100%', maxHeight: 144, objectFit: 'contain' }}
                      />
                    </Box>
                  </CardActionArea>
                  <CardContent sx={{ p: 1.5 }}>
                    <Stack spacing={1}>
                      <Box>
                        <Typography fontWeight={800} noWrap title={emote.englishName}>
                          {emote.englishName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap title={emote.originalName}>
                          {emote.originalName}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip size="small" label={emote.fileName.replace('.gif', '')} sx={{ maxWidth: 126 }} />
                        <Tooltip title="复制">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => copyEmote(emote)}
                            aria-label={`复制 ${emote.englishName}`}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: '70vh' }}>
              <Table stickyHeader size="small" aria-label="映射表">
                <TableHead>
                  <TableRow>
                    <TableCell>原译名</TableCell>
                    <TableCell>英文译名</TableCell>
                    <TableCell>英文文件名</TableCell>
                    <TableCell>源文件名</TableCell>
                    <TableCell align="right">复制</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmotes.map((emote) => (
                    <TableRow key={emote.fileName} hover>
                      <TableCell>{emote.originalName}</TableCell>
                      <TableCell>{emote.englishName}</TableCell>
                      <TableCell>{emote.fileName}</TableCell>
                      <TableCell>{emote.sourceFile}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="复制">
                          <IconButton size="small" onClick={() => copyEmote(emote)} aria-label={`复制 ${emote.englishName}`}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>

        <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
          {selected ? (
            <>
              <DialogTitle>{selected.englishName}</DialogTitle>
              <DialogContent>
                <Stack spacing={2}>
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
                      alt={selected.englishName}
                      sx={{ maxWidth: '100%', maxHeight: 360, objectFit: 'contain' }}
                    />
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label={selected.originalName} />
                    <Chip label={selected.fileName} variant="outlined" />
                  </Stack>
                  <Divider />
                  <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                    {getAbsoluteUrl(selected.fileName)}
                  </Typography>
                </Stack>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button startIcon={<LinkIcon />} onClick={() => copyEmote(selected, 'url')}>
                  URL
                </Button>
                <Button startIcon={<FileCopyIcon />} onClick={() => copyEmote(selected, 'markdown')}>
                  Markdown
                </Button>
                <Button variant="contained" startIcon={<ContentCopyIcon />} onClick={() => copyEmote(selected, 'filename')}>
                  文件名
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
