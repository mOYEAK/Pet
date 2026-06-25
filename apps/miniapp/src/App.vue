<script setup lang="ts">
const appName = "宠伴管家";
void appName;
</script>

<style>
page {
  background: #f8fafc;
  color: #1f2937;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

button {
  margin: 0;
  border-radius: 8px;
}

input,
textarea,
picker {
  box-sizing: border-box;
}

uni-input.field {
  display: block;
  height: 44px;
  padding: 0 12px;
}

uni-input.field .uni-input-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
}

uni-input.field .uni-input-input {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  min-height: 42px;
  color: #111827;
  line-height: 42px;
  opacity: 1;
}

uni-input.field .uni-input-placeholder {
  pointer-events: none;
}

uni-textarea.textarea .uni-textarea-textarea {
  position: relative;
  z-index: 1;
  min-height: 72px;
  color: #111827;
  opacity: 1;
}

uni-textarea.textarea .uni-textarea-placeholder {
  pointer-events: none;
}
</style>
