<template>
  <div>
    <div id="editor"></div>
  </div>
</template>

<script>
import ace from "brace";
import * as js from "brace/mode/javascript";
import * as monokai from "brace/theme/monokai";

export default {
  name: "Editor",
  mounted() {
    this.editor = ace.edit("editor");
    this.editor.getSession().setMode("ace/mode/javascript");
    this.editor.setTheme("ace/theme/monokai");
  }
};
</script>

<style scoped>
#editor {
  width: 100%;
  height: 100%;
}
</style>
