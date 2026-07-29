import { billDelete, billList, billSave, billUpdate, type BillSaveParams } from '../../api/bill'
import { categoryList, type Category } from '../../api/category'
import config from '../../config/index'
import { BillType } from '../../constants/index'
import { pad } from '../../utils/format'
import { wxNavigateBack, wxShowModal, wxShowToast } from '../../utils/wx'
import type { IAppOption } from '../typings'

function todayStr() {
  const d = new Date()
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
}

Page({
  data: {
    BillType,
    editing: false,
    billId: '',
    categories: [] as Category[],
    incomeCategories: [] as Category[],
    expenseCategories: [] as Category[],
    filteredCategories: [] as Category[],

    formType: BillType.EXPENSE as string,
    formCategoryId: '',
    formCategoryName: '',
    formAmount: '',
    formDate: todayStr(),
    formRemark: '',
    showCategoryPicker: false,
    showDatePicker: false,
    currentDate: Date.now(),
    minDate: new Date(2020, 0).getTime(),
    maxDate: Date.now(),
    saving: false,

    app: {}
  },

  onLoad(options: Record<string, string>) {
    const { globalData } = getApp<IAppOption>()
    this.setData({ app: globalData })

    if (options.date) {
      this.setData({ formDate: options.date })
    }
    if (options.id) {
      this.setData({ editing: true, billId: options.id })
    }

    this.loadCategories()
    if (options.id) {
      this.loadBill()
    }
  },

  loadCategories() {
    categoryList().then(({ data }) => {
      const cats = (data || []).map((c: Category) => {
        const isImg = !!(c.icon && (c.icon.indexOf(config.uploadPath) === 0 || c.icon.indexOf('http') === 0))
        return {
          ...c,
          iconIsImage: isImg,
          icon: isImg && c.icon.indexOf(config.uploadPath) === 0 ? config.url + c.icon : c.icon
        }
      })
      const incomeCats = cats.filter((c) => c.type === BillType.INCOME)
      const expenseCats = cats.filter((c) => c.type === BillType.EXPENSE)
      this.setData({
        categories: cats,
        incomeCategories: incomeCats,
        expenseCategories: expenseCats
      })
      if (!this.data.editing) {
        this.filterCategories()
      }
    })
  },

  loadBill() {
    billList({ type: '', startDate: '', endDate: '', pageNum: 1, pageSize: 200 }).then(({ data: res }) => {
      const records = res.records || []
      const bill = records.find((b) => b.id === this.data.billId)
      if (!bill) return
      const cats = bill.type === BillType.INCOME ? this.data.incomeCategories : this.data.expenseCategories
      this.setData({
        formType: bill.type,
        formCategoryId: bill.categoryId,
        formCategoryName: bill.categoryName,
        formAmount: String(bill.amount),
        formDate: bill.billDate,
        formRemark: bill.remark || '',
        filteredCategories: cats
      })
    })
  },

  filterCategories() {
    const cats = this.data.formType === BillType.INCOME ? this.data.incomeCategories : this.data.expenseCategories
    this.setData({ filteredCategories: cats.length > 0 ? cats : this.data.expenseCategories })
  },

  onFormTypeChange(e: WechatMiniprogram.CustomEvent) {
    const type = e.currentTarget.dataset.type as string
    const cats = type === BillType.INCOME ? this.data.incomeCategories : this.data.expenseCategories
    this.setData({ formType: type, formCategoryId: '', formCategoryName: '', filteredCategories: cats })
  },

  onFormCategoryOpen() {
    this.setData({ showCategoryPicker: true })
  },

  onFormCategoryClose() {
    this.setData({ showCategoryPicker: false })
  },

  onFormCategorySelect(e: WechatMiniprogram.CustomEvent) {
    const cat = e.currentTarget.dataset.cat as Category
    this.setData({
      formCategoryId: cat.id,
      formCategoryName: cat.name,
      showCategoryPicker: false
    })
  },

  onFormAmountInput(e: WechatMiniprogram.Input) {
    this.setData({ formAmount: e.detail.value })
  },

  onFormRemarkInput(e: WechatMiniprogram.Input) {
    this.setData({ formRemark: e.detail.value })
  },

  onFormDateTap() {
    this.setData({ showDatePicker: true, currentDate: new Date(this.data.formDate).getTime() })
  },

  onDatePickerClose() {
    this.setData({ showDatePicker: false })
  },

  onDateConfirm(e: WechatMiniprogram.CustomEvent) {
    const val = new Date(e.detail as unknown as number)
    const dateStr = val.getFullYear() + '-' + pad(val.getMonth() + 1) + '-' + pad(val.getDate())
    this.setData({ formDate: dateStr, showDatePicker: false })
  },

  onFormSubmit() {
    const { formType, formCategoryId, formAmount, formDate, formRemark, editing, billId } = this.data

    if (!formCategoryId) {
      wxShowToast({ title: '请选择分类' })
      return
    }
    const amount = parseFloat(formAmount)
    if (!formAmount || isNaN(amount) || amount <= 0) {
      wxShowToast({ title: '请输入有效金额' })
      return
    }
    if (!formDate) {
      wxShowToast({ title: '请选择日期' })
      return
    }

    const params: BillSaveParams = {
      categoryId: formCategoryId,
      type: formType,
      amount: Math.round(amount * 100) / 100,
      billDate: formDate,
      remark: formRemark || undefined
    }

    this.setData({ saving: true })

    const request = editing ? billUpdate(billId, params) : billSave(params)
    request
      .then(({ msg }) => {
        wxShowToast({ title: msg || '保存成功' })
        wxNavigateBack()
      })
      .catch(() => {
        this.setData({ saving: false })
      })
  },

  onFormDelete() {
    const { editing, billId } = this.data
    if (!editing || !billId) return
    wxShowModal({
      title: '确认删除',
      content: '确定要删除这笔账单吗？'
    }).then((res) => {
      if (res.confirm) {
        billDelete(billId).then(({ msg }) => {
          wxShowToast({ title: msg || '删除成功' })
          wxNavigateBack()
        })
      }
    })
  },

  handleBack() {
    wxNavigateBack()
  },
  onShareAppMessage() {
    return {
      title: '钱罐罐记账 - 好好记账，天天向上',
      path: '/pages/bill/index'
    }
  }
})
