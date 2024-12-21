import {
  /* eslint-disable @typescript-eslint/ban-types */
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

export function IsEither(
  moduleId: string,
  moduleName: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEither',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [moduleId, moduleName],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [moduleId, moduleName] = args.constraints;
          const obj = args.object as any;
          return (
            (obj[moduleId] && !obj[moduleName]) ||
            (!obj[moduleId] && obj[moduleName])
          );
        },
        defaultMessage(args: ValidationArguments) {
          const [moduleId, moduleName] = args.constraints;
          return `모듈 ID: ${moduleId} 와 모듈명: '${moduleName}'은 함께 요청할 수 없습니다.`;
        },
      },
    });
  };
}
