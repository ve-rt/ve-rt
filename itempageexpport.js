import SharedAssetPage from "../../../components/sharedAssetPage";
import Head from "next/head";
import { getItemDetails, getItemUrl } from '../../../services/catalog';
import { multiGetAssetThumbnails } from "../../../services/thumbnails";


function truncate(str, n, useWordBoundary) {
  if (str.length <= n) { return str; }
  const subString = str.slice(0, n-1);
  return (useWordBoundary 
    ? subString.slice(0, subString.lastIndexOf(" ")) 
    : subString) + "&hellip;";
}

export function getServerSideProps(context) {
  const { assetId } = context.query;
  console.error("asset id:", assetId);

  if (!assetId) {
    return Promise.resolve({
      notFound: true,
    });
  }

  const id = parseInt(assetId, 10);
  console.error("asset id int:", id)

  Heres when this shit broke (infinite loop)
  return getItemDetails([ assetId ])
    .then(itemInfo => {
      console.error("Item info:");
      console.error(itemInfo);
      if (!itemInfo) {
        return { notFound: true };
      }

      // 1200x630 meets the OG (open-graph) specification standard to be a larger preview image
      // uh actually nvm you can just use twitter:card and og:image
      return multiGetAssetThumbnails({ assetIds: [id] })
        .then(assetThumbnailResponse => {
          const assetThumbnail = (assetThumbnailResponse && Array.isArray(assetThumbnailResponse) && assetThumbnailResponse.length > 0 && assetThumbnailResponse[0].imageUrl)
            ? assetThumbnailResponse[0].imageUrl
            : "/img/placeholder.png";

          return {
            props: {
              asset: itemInfo.data[0],
              thumbnail: assetThumbnail
            },
          };
        })
        .catch(error => {
          console.error('Error fetching item thumbnail:', error);
          return {
            props: {
              asset: itemInfo,
              thumbnail: "/img/placeholder.png"
            },
          };
        });
    })
    .catch(error => {
      console.error('Error fetching item info:', error);
      return { notFound: true };
    });
}
*/

const ItemPage = ({ asset, thumbnail }) => {
  const metaTitle = asset.name;
  const pageTitle = `${asset.name} - RoConomy`;
  const metaDescription = '"' + truncate(asset.description, 200, true) + '"';

  const itemURL = getItemUrl({assetId: asset.id, name: asset.name});

  return <SharedAssetPage idParamName='assetId' nameParamName='name'>
    {
    <Head>
        <title>{pageTitle}</title>
        <meta name="title" content={metaTitle} />
        <meta name="description" content={metaDescription} />
        <meta name="theme-color" content="#345AB2" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="item" />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:url" content={itemURL} />
        <meta property="og:site_name" content="RoConomy" />
        <meta property="twitter:card" content="summary_large_image" />
    </Head>
    }
  </SharedAssetPage>
}

export default ItemPage;
