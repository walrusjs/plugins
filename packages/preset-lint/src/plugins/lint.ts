import { Api } from '@walrus/types';

export default function(api: Api) {
  api.describe({
    key: 'lint',
    config: {
      default: {
        staged: true
      },
      schema(joi) {
        return joi.object({
          // 预提交模式 - 会直接处理完的文件重新暂存
          staged: joi.boolean()
        });
      }
    }
  });
}
