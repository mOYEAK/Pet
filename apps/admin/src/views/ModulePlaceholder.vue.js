import { computed } from "vue";
const props = defineProps();
const title = computed(() => props.module.charAt(0).toUpperCase() + props.module.slice(1));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.title);
const __VLS_0 = {}.ElEmpty;
/** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    description: "Module scaffold is ready. Business pages come next.",
}));
const __VLS_2 = __VLS_1({
    description: "Module scaffold is ready. Business pages come next.",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            title: title,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
