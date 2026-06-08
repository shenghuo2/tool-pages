<script setup>
const tools = [
  {
    title: 'sd-trans',
    href: './sd-trans/',
    description: '对于 SD 格式的 Prompt 接入大模型快速翻译、方便调整',
    type: 'sakura',
    color: '#8338ec',
  },
  {
    title: 'img-compare',
    href: './img-compare/',
    description: '以叠加形式比较两张图片，对于分辨率不同的两张图片会进行缩放处理',
    type: 'info',
    color: '#0077ff',
  },
  {
    title: 'shenghuo2-nienie-emotes',
    href: './emotes/',
    description: '使用 EmoteLab 生成的 OC 表情包合集',
    type: 'primary',
    color: '#ff006e',
  },
]
</script>

<template>
  <main class="page-shell">
    <section class="intro-panel">
      <p class="eyebrow">
        shenghuo2/tool-pages
      </p>
      <h1>shenghuo2的实验室</h1>
      <p class="summary">
        一些奇妙的小工具
      </p>
    </section>

    <section
      class="tool-list"
      aria-label="工具列表"
    >
      <px-card
        v-for="tool in tools"
        :key="tool.href"
        class="tool-card"
        shadow="hover"
      >
        <div class="tool-card__content">
          <div class="tool-card__text">
            <h2
              class="tool-title"
              :style="{ color: tool.color }"
            >
              {{ tool.title }}
            </h2>
            <p>{{ tool.description }}</p>
          </div>
          <a
            class="enter-button"
            :href="tool.href"
          >
            进入
          </a>
        </div>
      </px-card>
    </section>
  </main>
</template>
