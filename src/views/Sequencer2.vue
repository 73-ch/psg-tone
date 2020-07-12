<template>
  <div>
    <editor class="editor"></editor>
  </div>
</template>

<script>
import editor from "@/components/editor";
export default {
  name: "Sequencer2",
  components: { editor }
};
</script>

<style scoped>
.editor {
  width: 500px;
  height: 600px;
}
</style>
