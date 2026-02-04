
export type PhotoPreset = 'passport' | 'id_card' | 'driver_license' | 'visa_us' | 'custom';

export interface PhotoSize {
  name: string;
  widthMm: number;
  heightMm: number;
  description: string;
  guidelines: string[];
}

export const PHOTO_PRESETS: Record<Exclude<PhotoPreset, 'custom'>, PhotoSize> = {
  passport: {
    name: '여권용 (Passport)',
    widthMm: 35,
    heightMm: 45,
    description: '3.5cm x 4.5cm / 외교부 규격',
    guidelines: [
      '배경은 균일한 흰색이어야 하며 테두리가 없어야 합니다.',
      '정면을 응시하고 입은 다물어야 합니다 (치아 미노출).',
      '눈썹 전체와 얼굴 윤곽이 명확히 보여야 합니다.',
      '모자, 머리띠, 색안경 등은 착용이 불가합니다.',
      '어깨선이 정면을 향해야 합니다.'
    ]
  },
  id_card: {
    name: '주민등록증용 (ID Card)',
    widthMm: 35,
    heightMm: 45,
    description: '3.5cm x 4.5cm / 주민등록법 규격',
    guidelines: [
      '6개월 이내에 촬영한 사진이어야 합니다.',
      '모자를 쓰지 않은 정면 상반신 사진이어야 합니다.',
      '배경은 단색(가급적 밝은 색)을 권장합니다.',
      '얼굴 크기가 너무 작지 않게 조절해 주세요.'
    ]
  },
  driver_license: {
    name: '운전면허증용 (Driver License)',
    widthMm: 35,
    heightMm: 45,
    description: '3.5cm x 4.5cm / 경찰청 규격',
    guidelines: [
      '여권 사진 규격과 동일하게 촬영하는 것을 원칙으로 합니다.',
      '배경색은 무배색(흰색 권장)이어야 합니다.',
      '정면을 응시하고 탈모 상태여야 합니다.',
      '사진 인화 시 해상도가 떨어지지 않도록 주의하세요.'
    ]
  },
  visa_us: {
    name: '미국 비자용 (US Visa)',
    widthMm: 51,
    heightMm: 51,
    description: '5.1cm x 5.1cm (2"x2") / 국무부 규격',
    guidelines: [
      '안경 착용이 절대 금지됩니다 (시력 교정용 포함).',
      '배경은 반드시 흰색 또는 오프화이트여야 합니다.',
      '정수리부터 턱까지의 길이가 전체 높이의 50~69%여야 합니다.',
      '최근 6개월 이내에 촬영된 사진이어야 합니다.'
    ]
  }
};

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}
