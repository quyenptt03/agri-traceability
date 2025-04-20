function generatePrompt(events: any[] = []) {
  if (!events.length) {
    return 'Không có sự kiện Count changes nào để phân tích.';
  }

  let prompt =
    `Dưới đây là danh sách các sự kiện Count changes. Hãy phân tích:\n` +
    '- Số liệu thay đổi tăng hay giảm? Đâu là dấu hiệu tốt? Đâu là dấu hiệu bất thường?\n' +
    '- Nếu phát huy tốt thì khuyến khích nông trại làm gì để giữ hoặc nâng cao chất lượng?\n' +
    '- Nếu bất thường thì nên làm gì để cải thiện trong tuần tới?\n\n';

  events.forEach((event) => {
    prompt += `Camera: ${event.camera_id}\n`;
    prompt += `Thời gian: ${event.timestamp}\n`;
    prompt += `Trước: ${event.count_before}, Sau: ${event.count_after}, Thay đổi: ${event.change}\n`;
    prompt += `Ghi chú: ${event.note || 'Không có ghi chú'}\n\n`;
  });

  return prompt;
}

function generatePromptForHerds(herds: any[] = []) {
  if (herds.length === 0) {
    return 'Không có dữ liệu nào để phân tích.';
  }

  let prompt = `Bạn là chuyên gia phân tích nông nghiệp.

      Dưới đây là dữ liệu lịch sử số lượng vật nuôi của một nông trại theo từng thời điểm. Hãy thực hiện các bước phân tích sau cho từng loại vật nuôi:

      1. Phân tích xu hướng: Số liệu có xu hướng tăng, giảm hay dao động?
      2. Đánh giá hiện trạng.
      3. Đưa ra khuyến nghị phù hợp.

      Trình bày câu trả lời theo từng vật nuôi và định dạng kết quả bằng Markdown (tiêu đề, danh sách), mỗi loại gồm:
      - Xu hướng:
      - Nhận định:
      - Khuyến nghị:

      Dưới đây là dữ liệu:\n\n`;
  herds.forEach((herd) => {
    prompt += `ID: ${herd.name}\n`;
    prompt += `Dữ liệu số lượng đàn từ trong ${herd.time}}: ${herd.history}\n`;
    prompt += `Ghi chú: ${herd.note || 'Không có ghi chú'}\n\n`;
  });

  return prompt;
}

function generatePromptForResources(resources: any[] = []) {
  if (resources.length === 0) {
    return 'Không có dữ liệu nào để phân tích.';
  }

  let prompt = `Dưới đây là dữ liệu lịch sử sử dụng hoặc tồn kho tài nguyên của một nông trại theo thời gian. Hãy phân tích:
    '- Mức sử dụng tài nguyên thay đổi theo xu hướng tăng hay giảm? Có dấu hiệu bất thường không?\n' +
    '- Nếu xu hướng tốt thì khuyến khích nông trại làm gì để duy trì hoặc cải thiện?
    '- Nếu có bất thường thì cần điều chỉnh hoặc cải thiện ra sao trong thời gian tiếp theo?
    
    1. Phân tích xu hướng: Số liệu có xu hướng tăng, giảm hay dao động?
    2. Đánh giá hiện trạng.
    3. Đưa ra khuyến nghị phù hợp.

    Trình bày câu trả lời theo từng tài nguyên, mỗi loại gồm. Định dạng kết quả bằng Markdown (dùng code block, tiêu đề, danh sách):
    - Xu hướng:
    - Nhận định:
    - Khuyến nghị:`;

  resources.forEach((resource) => {
    prompt += `Tên tài nguyên: ${resource.name}\n`;
    prompt += `Dữ liệu lịch sử từ ngày ${resource.from_date} đến ${
      resource.to_date
    }: ${resource.history.join(', ')}\n`;
    prompt += `Ghi chú: ${resource.note || 'Không có ghi chú'}\n\n`;
  });

  return prompt;
}

function generatePromptForDiseases(diseases: any[] = []) {
  if (diseases.length === 0) {
    return 'Không có dữ liệu nào để phân tích.';
  }

  let prompt =
    `Dưới đây là dữ liệu về tình hình dịch bệnh xảy ra tại nông trại trong thời gian qua. Hãy phân tích:\n` +
    '- Số lượng ca bệnh tăng hay giảm? Có dấu hiệu bất thường hoặc đáng lo ngại không?\n' +
    '- Nếu xu hướng đang được kiểm soát tốt, hãy đề xuất các biện pháp duy trì hiệu quả đó.\n' +
    '- Nếu có xu hướng bất thường hoặc nghiêm trọng, cần đưa ra giải pháp cụ thể cho tuần tiếp theo.\n\n';

  diseases.forEach((disease) => {
    prompt += `Tên bệnh: ${disease.name}\n`;
    prompt += `Lịch sử số ca: ${disease.history.join(', ')}\n`;
    prompt += `Thời gian xuất hiện gần nhất: ${disease.lastOccurrence}\n`;
    prompt += `Ghi chú: ${disease.note || 'Không có ghi chú'}\n\n`;
  });

  return prompt;
}

export {
  generatePrompt,
  generatePromptForHerds,
  generatePromptForResources,
  generatePromptForDiseases,
};
