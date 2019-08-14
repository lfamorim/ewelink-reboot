type EWELinkRegion = 'cn' | 'us' | 'eu';

interface RebootParameters { 
  api?: any,
  region?: string | EWELinkRegion,
  email: string,
  password: string,
  device: string,
  addr: string,
  onOffInterval: number,
};

export default function ewelinkReboot(parameters: RebootParameters): Promise<boolean>