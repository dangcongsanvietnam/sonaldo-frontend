import { createSlice } from "@reduxjs/toolkit";
import { createBirthdayEmailTemplate, deleteBirthdayEmailTemplate, getBirthdayEmailTemplates, sendBirthdayEmail, sendPromotionEmail, updateBirthdayEmailTemplate } from "../services/emailService";

const emailSlice = createSlice({
  name: "email",
  initialState: {
    loading: 'idle',
    birthdayTemplates: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendBirthdayEmail.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(sendBirthdayEmail.fulfilled, (state, action) => {
        state.loading = 'succeeded';
      })
      .addCase(sendBirthdayEmail.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })
      .addCase(sendPromotionEmail.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(sendPromotionEmail.fulfilled, (state, action) => {
        state.loading = 'succeeded';
      })
      .addCase(sendPromotionEmail.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      });
      builder.addCase(getBirthdayEmailTemplates.pending, (state) => {
        state.loading = 'pending';
      });
      builder.addCase(getBirthdayEmailTemplates.fulfilled, (state, action) => {
        state.birthdayTemplates = action.payload;
        state.loading = 'succeeded';
      });
      builder.addCase(getBirthdayEmailTemplates.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      });
  
      // Thêm extraReducers cho createBirthdayEmailTemplate
      builder.addCase(createBirthdayEmailTemplate.pending, (state) => {
        state.loading = 'pending';
      });
      builder.addCase(createBirthdayEmailTemplate.fulfilled, (state, action) => {
        state.birthdayTemplates.push(action.payload); // Thêm template mới vào danh sách
        state.loading = 'succeeded';
      });
      builder.addCase(createBirthdayEmailTemplate.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      });
  
      // Thêm extraReducers cho updateBirthdayEmailTemplate
      builder.addCase(updateBirthdayEmailTemplate.pending, (state) => {
        state.loading = 'pending';
      });
      builder.addCase(updateBirthdayEmailTemplate.fulfilled, (state, action) => {
        const updatedTemplate = action.payload;
        const templateIndex = state.birthdayTemplates.findIndex((template) => template.templateId === updatedTemplate.templateId);
        if (templateIndex !== -1) {
          state.birthdayTemplates[templateIndex] = updatedTemplate; // Cập nhật template trong danh sách
        }
        state.loading = 'succeeded';
      });
      builder.addCase(updateBirthdayEmailTemplate.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      });
  
      // Thêm extraReducers cho deleteBirthdayEmailTemplate
      builder.addCase(deleteBirthdayEmailTemplate.pending, (state) => {
        state.loading = 'pending';
      });
      builder.addCase(deleteBirthdayEmailTemplate.fulfilled, (state, action) => {
        const deletedTemplateId = action.meta.arg;
        state.birthdayTemplates = state.birthdayTemplates.filter((template) => template.templateId !== deletedTemplateId); // Xóa template khỏi danh sách
        state.loading = 'succeeded';
      });
      builder.addCase(deleteBirthdayEmailTemplate.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      });
  },
});

export default emailSlice.reducer;