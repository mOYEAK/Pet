import { ElMessage } from "element-plus";
import { onMounted, ref } from "vue";
import { api } from "../api/client";
import { formatDateTime } from "../utils/format";
import { bookingStatusText, bookingStatusType } from "../utils/status";
const bookings = ref([]);
const loading = ref(false);
async function load() {
    loading.value = true;
    try {
        bookings.value = await api.bookings();
    }
    catch (error) {
        ElMessage.error(error instanceof Error ? error.message : "预约加载失败");
    }
    finally {
        loading.value = false;
    }
}
async function setStatus(id, status) {
    try {
        await api.updateBookingStatus(id, status);
        ElMessage.success("预约状态已更新");
        await load();
    }
    catch (error) {
        ElMessage.error(error instanceof Error ? error.message : "状态更新失败");
    }
}
async function cancel(id) {
    try {
        await api.cancelBooking(id);
        ElMessage.success("预约已取消");
        await load();
    }
    catch (error) {
        ElMessage.error(error instanceof Error ? error.message : "取消失败");
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
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.load)
};
__VLS_3.slots.default;
var __VLS_3;
const __VLS_8 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    data: (__VLS_ctx.bookings),
    border: true,
}));
const __VLS_10 = __VLS_9({
    data: (__VLS_ctx.bookings),
    border: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_11.slots.default;
const __VLS_12 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    label: "预约时间",
    minWidth: "170",
}));
const __VLS_14 = __VLS_13({
    label: "预约时间",
    minWidth: "170",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_15.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatDateTime(row.startTime));
    (__VLS_ctx.formatDateTime(row.endTime));
}
var __VLS_15;
const __VLS_16 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    label: "客户",
    width: "140",
}));
const __VLS_18 = __VLS_17({
    label: "客户",
    width: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_19.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (row.user?.nickname ?? row.user?.phone ?? row.userId);
}
var __VLS_19;
const __VLS_20 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    label: "宠物",
    width: "130",
}));
const __VLS_22 = __VLS_21({
    label: "宠物",
    width: "130",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_23.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (row.pet?.name ?? row.petId);
}
var __VLS_23;
const __VLS_24 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    label: "服务",
    minWidth: "150",
}));
const __VLS_26 = __VLS_25({
    label: "服务",
    minWidth: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_27.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (row.service?.name ?? row.serviceId);
}
var __VLS_27;
const __VLS_28 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    label: "状态",
    width: "110",
}));
const __VLS_30 = __VLS_29({
    label: "状态",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_31.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_32 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        type: (__VLS_ctx.bookingStatusType[row.status] ?? 'info'),
    }));
    const __VLS_34 = __VLS_33({
        type: (__VLS_ctx.bookingStatusType[row.status] ?? 'info'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    (__VLS_ctx.bookingStatusText[row.status] ?? row.status);
    var __VLS_35;
}
var __VLS_31;
const __VLS_36 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    label: "备注",
    prop: "remark",
    minWidth: "180",
    showOverflowTooltip: true,
}));
const __VLS_38 = __VLS_37({
    label: "备注",
    prop: "remark",
    minWidth: "180",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
const __VLS_40 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    label: "操作",
    width: "280",
    fixed: "right",
}));
const __VLS_42 = __VLS_41({
    label: "操作",
    width: "280",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_43.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_44 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        disabled: (row.status === 'CONFIRMED'),
    }));
    const __VLS_46 = __VLS_45({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        disabled: (row.status === 'CONFIRMED'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    let __VLS_48;
    let __VLS_49;
    let __VLS_50;
    const __VLS_51 = {
        onClick: (...[$event]) => {
            __VLS_ctx.setStatus(row.id, 'CONFIRMED');
        }
    };
    __VLS_47.slots.default;
    var __VLS_47;
    const __VLS_52 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        ...{ 'onClick': {} },
        link: true,
        type: "success",
        disabled: (row.status === 'SERVING'),
    }));
    const __VLS_54 = __VLS_53({
        ...{ 'onClick': {} },
        link: true,
        type: "success",
        disabled: (row.status === 'SERVING'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    let __VLS_56;
    let __VLS_57;
    let __VLS_58;
    const __VLS_59 = {
        onClick: (...[$event]) => {
            __VLS_ctx.setStatus(row.id, 'SERVING');
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
        type: "info",
        disabled: (row.status === 'COMPLETED'),
    }));
    const __VLS_62 = __VLS_61({
        ...{ 'onClick': {} },
        link: true,
        type: "info",
        disabled: (row.status === 'COMPLETED'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    let __VLS_64;
    let __VLS_65;
    let __VLS_66;
    const __VLS_67 = {
        onClick: (...[$event]) => {
            __VLS_ctx.setStatus(row.id, 'COMPLETED');
        }
    };
    __VLS_63.slots.default;
    var __VLS_63;
    const __VLS_68 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
        disabled: (row.status === 'CANCELLED'),
    }));
    const __VLS_70 = __VLS_69({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
        disabled: (row.status === 'CANCELLED'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    let __VLS_72;
    let __VLS_73;
    let __VLS_74;
    const __VLS_75 = {
        onClick: (...[$event]) => {
            __VLS_ctx.cancel(row.id);
        }
    };
    __VLS_71.slots.default;
    var __VLS_71;
}
var __VLS_43;
var __VLS_11;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formatDateTime: formatDateTime,
            bookingStatusText: bookingStatusText,
            bookingStatusType: bookingStatusType,
            bookings: bookings,
            loading: loading,
            load: load,
            setStatus: setStatus,
            cancel: cancel,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
