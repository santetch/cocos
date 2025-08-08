import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator';
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin';

const serviceSrcPath = `${process.cwd()}/src`;
console.log(`serviceSrcPath: ${serviceSrcPath}`);

const serviceName = 'cocos-backend';
console.log(`Generating metadata for service: ${serviceName}`);

const generator = new PluginMetadataGenerator();

generator.generate({
  visitors: [
    new ReadonlyVisitor({
      introspectComments: true,
      pathToSource: serviceSrcPath,
      dtoFileNameSuffix: '.dto',
    }),
  ],
  outputDir: serviceSrcPath,
  watch: false,
  tsconfigPath: './tsconfig.build.json',
});
