import { ElMessage } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import { api } from "../api/client";
import { formatMoney } from "../utils/format";
import { petTypeText, sizeTypeText } from "../utils/status";
const services = ref([]);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const editingId = ref(null);
const form = reactive({
    name: "",
    category: "",
    petType: "CAT",
    sizeType: "UNKNOWN",
    basePrice: 0,
    durationMinutes: 60,
    description: "",
    notice: "",
    enabled: true
});
async function load() {
    loading.value = true;
    try {
        services.value = await api.services();
    }
    catch (error) {
        ElMessage.error(error instanceof Error ? error.message : "服务项目加载失败");
    }
    finally {
        loading.value = false;
    }
}
function resetForm() {
    Object.assign(form, {
        name: "",
        category: "",
        petType: "CAT",
        sizeType: "UNKNOWN",
        basePrice: 0,
        durationMinutes: 60,
        description: "",
        notice: "",
        enabled: true
    });
}
function openCreate() {
    editingId.value = null;
    resetForm();
    dialogVisible.value = true;
}
function openEdit(service) {
    editingId.value = service.id;
    Object.assign(form, {
        name: service.name,
        category: service.category,
        petType: service.petType,
        sizeType: service.sizeType,
        basePrice: service.basePrice,
        durationMinutes: service.durationMinutes,
        description: service.description ?? "",
        notice: service.notice ?? "",
        enabled: service.enabled
    });
    dialogVisible.value = true;
}
async function save() {
    saving.value = true;
    try {
        if (editingId.value) {
            await api.updateService(editingId.value, form);
        }
        else {
            await api.createService(form);
        }
        ElMessage.success("服务项目已保存");
        dialogVisible.value = false;
        await load();
    }
    catch (error) {
        ElMessage.error(error instanceof Error ? error.message : "保存失败");
    }
    finally {
        saving.value = false;
    }
}
async function toggleEnabled(service) {
    try {
        await api.setServiceEnabled(service.id, !service.enabled);
        ElMessage.success(service.enabled ? "已停用" : "已启用");
        await load();
    }
    catch (error) {
        ElMessage.error(error instanceof Error ? error.message : "状态更新失败");
    }
}
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.openCreate)
};
__VLS_3.slots.default;
var __VLS_3;
const __VLS_8 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    data: (__VLS_ctx.services),
    border: true,
}));
const __VLS_10 = __VLS_9({
    data: (__VLS_ctx.services),
    border: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_11.slots.default;
const __VLS_12 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    prop: "name",
    label: "服务名称",
    minWidth: "160",
}));
const __VLS_14 = __VLS_13({
    prop: "name",
    label: "服务名称",
    minWidth: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const __VLS_16 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    prop: "category",
    label: "分类",
    width: "130",
}));
const __VLS_18 = __VLS_17({
    prop: "category",
    label: "分类",
    width: "130",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
const __VLS_20 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    label: "宠物",
    width: "90",
}));
const __VLS_22 = __VLS_21({
    label: "宠物",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_23.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.petTypeText[row.petType] ?? row.petType);
}
var __VLS_23;
const __VLS_24 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    label: "体型",
    width: "90",
}));
const __VLS_26 = __VLS_25({
    label: "体型",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_27.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.sizeTypeText[row.sizeType] ?? row.sizeType);
}
var __VLS_27;
const __VLS_28 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    label: "价格",
    width: "110",
}));
const __VLS_30 = __VLS_29({
    label: "价格",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_31.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatMoney(row.basePrice));
}
var __VLS_31;
const __VLS_32 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    label: "耗时",
    width: "100",
}));
const __VLS_34 = __VLS_33({
    label: "耗时",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_35.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (row.durationMinutes);
}
var __VLS_35;
const __VLS_36 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    label: "状态",
    width: "90",
}));
const __VLS_38 = __VLS_37({
    label: "状态",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_39.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_40 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        type: (row.enabled ? 'success' : 'info'),
    }));
    const __VLS_42 = __VLS_41({
        type: (row.enabled ? 'success' : 'info'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    (row.enabled ? "启用" : "停用");
    var __VLS_43;
}
var __VLS_39;
const __VLS_44 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    prop: "description",
    label: "说明",
    minWidth: "220",
    showOverflowTooltip: true,
}));
const __VLS_46 = __VLS_45({
    prop: "description",
    label: "说明",
    minWidth: "220",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const __VLS_48 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "操作",
    width: "190",
    fixed: "right",
}));
const __VLS_50 = __VLS_49({
    label: "操作",
    width: "190",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_51.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_52 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }));
    const __VLS_54 = __VLS_53({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    let __VLS_56;
    let __VLS_57;
    let __VLS_58;
    const __VLS_59 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openEdit(row);
        }
    };
    __VLS_55.slots.default;
    var __VLS_55;
    const __VLS_60 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        ...{ 'onClick': {} },
        link: true,
        type: (row.enabled ? 'warning' : 'success'),
    }));
    const __VLS_62 = __VLS_61({
        ...{ 'onClick': {} },
        link: true,
        type: (row.enabled ? 'warning' : 'success'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    let __VLS_64;
    let __VLS_65;
    let __VLS_66;
    const __VLS_67 = {
        onClick: (...[$event]) => {
            __VLS_ctx.toggleEnabled(row);
        }
    };
    __VLS_63.slots.default;
    (row.enabled ? "停用" : "启用");
    var __VLS_63;
}
var __VLS_51;
var __VLS_11;
const __VLS_68 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.editingId ? '编辑服务' : '新增服务'),
    width: "560px",
}));
const __VLS_70 = __VLS_69({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.editingId ? '编辑服务' : '新增服务'),
    width: "560px",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    labelWidth: "96px",
    model: (__VLS_ctx.form),
}));
const __VLS_74 = __VLS_73({
    labelWidth: "96px",
    model: (__VLS_ctx.form),
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    label: "服务名称",
}));
const __VLS_78 = __VLS_77({
    label: "服务名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    modelValue: (__VLS_ctx.form.name),
}));
const __VLS_82 = __VLS_81({
    modelValue: (__VLS_ctx.form.name),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
var __VLS_79;
const __VLS_84 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    label: "分类",
}));
const __VLS_86 = __VLS_85({
    label: "分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    modelValue: (__VLS_ctx.form.category),
}));
const __VLS_90 = __VLS_89({
    modelValue: (__VLS_ctx.form.category),
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
var __VLS_87;
const __VLS_92 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    label: "宠物类型",
}));
const __VLS_94 = __VLS_93({
    label: "宠物类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
const __VLS_96 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    modelValue: (__VLS_ctx.form.petType),
}));
const __VLS_98 = __VLS_97({
    modelValue: (__VLS_ctx.form.petType),
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    label: "猫",
    value: "CAT",
}));
const __VLS_102 = __VLS_101({
    label: "猫",
    value: "CAT",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
const __VLS_104 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    label: "狗",
    value: "DOG",
}));
const __VLS_106 = __VLS_105({
    label: "狗",
    value: "DOG",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
const __VLS_108 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    label: "其他",
    value: "OTHER",
}));
const __VLS_110 = __VLS_109({
    label: "其他",
    value: "OTHER",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
var __VLS_99;
var __VLS_95;
const __VLS_112 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    label: "适用体型",
}));
const __VLS_114 = __VLS_113({
    label: "适用体型",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    modelValue: (__VLS_ctx.form.sizeType),
}));
const __VLS_118 = __VLS_117({
    modelValue: (__VLS_ctx.form.sizeType),
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
const __VLS_120 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    label: "不限",
    value: "UNKNOWN",
}));
const __VLS_122 = __VLS_121({
    label: "不限",
    value: "UNKNOWN",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
const __VLS_124 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    label: "小型",
    value: "SMALL",
}));
const __VLS_126 = __VLS_125({
    label: "小型",
    value: "SMALL",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
const __VLS_128 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    label: "中型",
    value: "MEDIUM",
}));
const __VLS_130 = __VLS_129({
    label: "中型",
    value: "MEDIUM",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
const __VLS_132 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    label: "大型",
    value: "LARGE",
}));
const __VLS_134 = __VLS_133({
    label: "大型",
    value: "LARGE",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
var __VLS_119;
var __VLS_115;
const __VLS_136 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    label: "基础价格",
}));
const __VLS_138 = __VLS_137({
    label: "基础价格",
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
const __VLS_140 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    modelValue: (__VLS_ctx.form.basePrice),
    min: (0),
    precision: (2),
}));
const __VLS_142 = __VLS_141({
    modelValue: (__VLS_ctx.form.basePrice),
    min: (0),
    precision: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
var __VLS_139;
const __VLS_144 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    label: "预计耗时",
}));
const __VLS_146 = __VLS_145({
    label: "预计耗时",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
const __VLS_148 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    modelValue: (__VLS_ctx.form.durationMinutes),
    min: (1),
}));
const __VLS_150 = __VLS_149({
    modelValue: (__VLS_ctx.form.durationMinutes),
    min: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
var __VLS_147;
const __VLS_152 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    label: "服务说明",
}));
const __VLS_154 = __VLS_153({
    label: "服务说明",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
const __VLS_156 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
    rows: (3),
}));
const __VLS_158 = __VLS_157({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
var __VLS_155;
const __VLS_160 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    label: "注意事项",
}));
const __VLS_162 = __VLS_161({
    label: "注意事项",
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
const __VLS_164 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    modelValue: (__VLS_ctx.form.notice),
    type: "textarea",
    rows: (2),
}));
const __VLS_166 = __VLS_165({
    modelValue: (__VLS_ctx.form.notice),
    type: "textarea",
    rows: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
var __VLS_163;
const __VLS_168 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    label: "启用",
}));
const __VLS_170 = __VLS_169({
    label: "启用",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
const __VLS_172 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    modelValue: (__VLS_ctx.form.enabled),
}));
const __VLS_174 = __VLS_173({
    modelValue: (__VLS_ctx.form.enabled),
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
var __VLS_171;
var __VLS_75;
{
    const { footer: __VLS_thisSlot } = __VLS_71.slots;
    const __VLS_176 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
        ...{ 'onClick': {} },
    }));
    const __VLS_178 = __VLS_177({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_177));
    let __VLS_180;
    let __VLS_181;
    let __VLS_182;
    const __VLS_183 = {
        onClick: (...[$event]) => {
            __VLS_ctx.dialogVisible = false;
        }
    };
    __VLS_179.slots.default;
    var __VLS_179;
    const __VLS_184 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.saving),
    }));
    const __VLS_186 = __VLS_185({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.saving),
    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    let __VLS_188;
    let __VLS_189;
    let __VLS_190;
    const __VLS_191 = {
        onClick: (__VLS_ctx.save)
    };
    __VLS_187.slots.default;
    var __VLS_187;
}
var __VLS_71;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formatMoney: formatMoney,
            petTypeText: petTypeText,
            sizeTypeText: sizeTypeText,
            services: services,
            loading: loading,
            saving: saving,
            dialogVisible: dialogVisible,
            editingId: editingId,
            form: form,
            openCreate: openCreate,
            openEdit: openEdit,
            save: save,
            toggleEnabled: toggleEnabled,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
