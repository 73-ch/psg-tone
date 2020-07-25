<template>
  <div id="app">
    <ul>
      <li><router-link to="/">ファミコンオシレータデモ</router-link></li>
      <li><router-link to="/sequencer">パターン自動生成デモ（途中）</router-link></li>
      <li><router-link to="/sequencer2">テキストベースシーケンサプロトタイプ</router-link></li>
      <li><router-link to="/compare_noise">ノイズオシレータの比較</router-link></li>
    </ul>
    <router-view />
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
