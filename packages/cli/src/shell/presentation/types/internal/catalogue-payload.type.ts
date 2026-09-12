import { asterCommandPayloadKinds } from "../../../../command/constants/aster-command-payload-kinds.constant.js";
import type { AsterCommandPayloadType } from "../../../../command/types/index.js";

/**
 * @description Closed catalogue-owned payload family accepted by human presentation.
 */
export type TCataloguePayload = Extract<
  AsterCommandPayloadType,
  {
    /** @description Catalogue-owned payload discriminator accepted by human presentation. */
    kind:
      | typeof asterCommandPayloadKinds.catalogueList
      | typeof asterCommandPayloadKinds.collectionList
      | typeof asterCommandPayloadKinds.iconList
      | typeof asterCommandPayloadKinds.search
      | typeof asterCommandPayloadKinds.iconShow
      | typeof asterCommandPayloadKinds.collectionShow;
  }
>;
