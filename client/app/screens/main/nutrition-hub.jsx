import { StyleSheet, TouchableOpacity, View, } from "react-native";
import { useEffect, useContext, useState } from "react";
import { router } from "expo-router";
import { routes, } from "../../common/settings/constants";
import { colors, nutritionColors } from "../../common/settings/styling";
import AppText from "../../components/screen-comps/app-text";
import { Platform } from "react-native";
import { dietOptions } from "../../common/utils/global-options";
import { scaleFont } from "../../common/utils/scale-fonts";
import { UserContext } from "../../common/contexts/user-context";
import { Image } from "expo-image";
import { Images } from "../../common/settings/assets";
import { goalsDietaryFeedbackTips } from "../../common/utils/text-generator";
import { convertEnergy, convertFluid } from "../../common/utils/unit-converter";
import { formatDate } from "../../common/utils/date-time";
import usePopups from "../../common/hooks/use-popups";
import { totalDayConsumption } from "../../common/utils/metrics-calculator";
import APIService from "../../common/services/api-service";
import FloatingActionMenu from "../../components/screen-comps/floating-action-menu";
import ProgressBar from "../../components/screen-comps/progress-bar";
import DateDisplay from "../../components/screen-comps/date-display";
import AppScroll from "../../components/screen-comps/app-scroll";

export default function NutritionHub() {
     const { createInput, showSpinner, hideSpinner, createToast } = usePopups();
     const { user, setUser } = useContext(UserContext);
     const [log, setLog] = useState({})
     const [diet, setDiet] = useState({});
     const [dietTips, setDietTips] = useState([]);

     useEffect(() => {
          const diet = dietOptions.find(item => item.key === user.nutrition.diet);
          const dietTips = goalsDietaryFeedbackTips(user, 3);

          setDiet(diet);
          setDietTips(dietTips);
     }, [user.nutrition]);

     useEffect(() => {
          async function prepareDayLog() {
               showSpinner();
               const todayKey = formatDate(new Date(), { format: 'YYYY-MM-DD' });

               try {
                    let todayObject = user.nutritionLogs?.[todayKey];

                    if (!todayObject) {
                         const result = await APIService.nutrition.days.futureDays(todayKey);

                         if (result.success) {
                              todayObject = result.data.newDays[todayKey];
                              setUser(prev => ({
                                   ...prev,
                                   nutritionLogs: { ...(prev.nutritionLogs || {}), ...result.data.newDays }
                              }));
                         } else {
                              console.log(result.message);
                              createToast({ message: `Server error, ${result.message}` });
                         }
                    }

                    const { energyKcal, carbs, protein, fat } = totalDayConsumption(todayObject);
                    todayObject.consumedEnergyKcal = energyKcal;
                    todayObject.consumedCarbGrams = carbs;
                    todayObject.consumedProteinGrams = protein;
                    todayObject.consumedFatGrams = fat;

                    setLog(todayObject);
               } catch (err) {
                    console.log("Failed to create today's nutrition day:", err.message);
               } finally {
                    hideSpinner();
               }
          }

          prepareDayLog();
     }, [user.nutritionLogs]);

     return (
          <>
               <FloatingActionMenu
                    overlayColor="rgba(0, 0, 0, 0.8)"
                    actions={[
                         { icon: Images.statistics2, title: 'Statistical Analysis', onPress: () => console.log("Stats"), closeOnAction: true, delayClosure: true },
                         { icon: Images.book4, title: 'Meals Log', onPress: () => router.push(routes.MEALS_LOG), closeOnAction: true, delayClosure: true },
                    ]}
                    position={{ bottom: 140, right: 20 }}
                    syncWithNavBar={true}
               />
               <AppScroll extraBottom={150} extraTop={0} hideNavBarOnScroll={true} hideTopBarOnScroll={true}>
                    <View style={{ margin: 0, paddingHorizontal: 15, paddingTop: 60, paddingBottom: 15, borderRadius: 0, backgroundColor: colors.cardBackground }}>
                         <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                              <AppText style={{ fontSize: scaleFont(15), color: colors.white, fontWeight: 'bold' }}>
                                   Daily Nutrition Targets
                              </AppText>
                              <View style={{ justifyContent: 'center' }}>
                                   <DateDisplay showDay={false} dateStyle={{ fontSize: scaleFont(14) }} uppercaseDate={false} />
                              </View>
                         </View>

                         <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                              {[
                                   { label: 'Carbs', target: log?.targetCarbGrams || user.nutrition.carbGrams, consumed: log?.consumedCarbGrams || 0, color: nutritionColors.carbs1 },
                                   { label: 'Protein', target: log?.targetProteinGrams || user.nutrition.proteinGrams, consumed: log?.consumedProteinGrams || 0, color: nutritionColors.protein1 },
                                   { label: 'Fat', target: log?.targetFatGrams || user.nutrition.fatGrams, consumed: log?.consumedFatGrams || 0, color: nutritionColors.fat1 },
                              ].map((macro, i) => {
                                   return (
                                        <ProgressBar
                                             key={i}
                                             title={macro.label}
                                             current={macro.consumed}
                                             max={macro.target}
                                             unit={'g'}
                                             color={macro.color}
                                             styleType="inline"
                                             height={10}
                                             width={"30%"}
                                             borderRadius={5}
                                             valueStyle={{ fontSize: scaleFont(12) }}
                                        />
                                   );
                              })}
                         </View>

                         <View style={{ marginBottom: 15 }}>
                              <ProgressBar
                                   title="Energy"
                                   current={convertEnergy(log?.consumedEnergyKcal || 0, 'kcal', user.preferences.energyUnit.key)}
                                   max={convertEnergy(log?.targetEnergyKcal || user.nutrition.setEnergyKcal, 'kcal', user.preferences.energyUnit.key)}
                                   unit={user.preferences.energyUnit.field}
                                   color={nutritionColors.energy1}
                                   styleType="header"
                                   height={10}
                                   borderRadius={5}
                              />
                         </View>


                         <View style={{ marginBottom: 10 }}>
                              <ProgressBar
                                   title="Water"
                                   current={convertFluid(log?.consumedWaterMl || 0, 'ml', user.preferences.fluidUnit.key).toFixed(0)}
                                   max={convertFluid(log?.targetWaterMl || user.nutrition.waterMl, 'ml', user.preferences.fluidUnit.key).toFixed(0)}
                                   unit={user.preferences.fluidUnit.field}
                                   color={nutritionColors.water1}
                                   styleType="header"
                                   height={10}
                                   borderRadius={5}
                              />
                         </View>

                         <AppText style={{ fontSize: scaleFont(11), color: colors.mutedText, textAlign: 'center', marginTop: 5 }}>
                              Macro Ratios by Total Daily Energy
                         </AppText>
                    </View>

                    <AppText style={[styles.sectionTitle, { marginHorizontal: 25, fontSize: scaleFont(15), marginBottom: 0, marginTop: 25 }]}>Make sure to always log your meals!</AppText>

                    <TouchableOpacity onPress={() => router.push(routes.MEALS_LOG)} style={[styles.card, { padding: 0 }]}>
                         <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', margin: 10 }}>
                                   <View  style={{backgroundColor: colors.main + '20', borderRadius: 10, padding: 10}}>
                                        <Image
                                             source={Images.book5}
                                             style={{ width: 40, height: 40, tintColor: colors.main }}
                                        />
                                   </View>
                                   <View style={{ justifyContent: 'flex-start', marginStart: 15 }}>
                                        <View>
                                             <AppText style={{ color: colors.main, fontSize: scaleFont(18), fontWeight: 'bold' }}>
                                                  Meals Logger
                                             </AppText>
                                             <AppText style={{ color: colors.mutedText, fontSize: scaleFont(10) }}>
                                                  Tap to go to your meals logger
                                             </AppText>
                                        </View>
                                   </View>
                              </View>
                              <View style={{ alignItems: 'flex-end', marginEnd: 10 }}>
                                   <Image source={Images.arrow} style={styles.arrow} />
                              </View>
                         </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push(routes.MEALS_LOG)} style={[styles.card, { padding: 0 }]}>
                         <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', margin: 10, flexShrink: 1 }}>
                                   <View style={{backgroundColor: colors.accentBlue + '20', borderRadius: 10, padding: 10}}>
                                        <Image
                                             source={Images.plan2}
                                             style={{ width: 40, height: 40, tintColor: colors.accentBlue }}
                                        />
                                   </View>
                                   <View style={{ justifyContent: 'flex-start', marginStart: 15, marginEnd: 70 }}>
                                        <View>
                                             <AppText style={{ color: colors.accentBlue, fontSize: scaleFont(18), fontWeight: 'bold' }}>
                                                  Nutrition Plans
                                             </AppText>
                                             <AppText style={{ color: colors.mutedText, fontSize: scaleFont(10) }}>
                                                  Build and prepare your own meals which you can import to your logger
                                             </AppText>
                                        </View>
                                   </View>
                              </View>
                              <View style={{ alignItems: 'flex-end', marginEnd: 10 }}>
                                   <Image source={Images.arrow} style={styles.arrow} />
                              </View>
                         </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push(routes.MEALS_LOG)} style={[styles.card, { padding: 0 }]}>
                         <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', margin: 10, flexShrink: 1 }}>
                                   <View  style={{backgroundColor: colors.accentGreen + '20', borderRadius: 10, padding: 10}}>
                                        <Image
                                             source={Images.foodsOne}
                                             style={{ width: 40, height: 40, tintColor: colors.accentGreen }}
                                        />
                                   </View>
                                   <View style={{ justifyContent: 'flex-start', marginStart: 15, marginEnd: 70 }}>
                                        <View>
                                             <AppText style={{ color: colors.accentGreen, fontSize: scaleFont(18), fontWeight: 'bold' }}>
                                                  My Foods
                                             </AppText>
                                             <AppText style={{ color: colors.mutedText, fontSize: scaleFont(10) }}>
                                                  Tap to explore your food list and other community and library foods
                                             </AppText>
                                        </View>
                                   </View>
                              </View>
                              <View style={{ alignItems: 'flex-end', marginEnd: 10 }}>
                                   <Image source={Images.arrow} style={styles.arrow} />
                              </View>
                         </View>

                    </TouchableOpacity>
               </AppScroll >
          </>
     );
}

const styles = StyleSheet.create({
     scrollContent: {
          backgroundColor: colors.background,
     },
     card: {
          backgroundColor: colors.cardBackground,
          padding: 15,
          borderRadius: 15,
          marginTop: 15,
          marginHorizontal: 15,
     },
     sectionTitle: {
          fontSize: scaleFont(19),
          fontWeight: '700',
          color: 'white',
          marginBottom: 12,
     },
     feedbackRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          marginBottom: 6,
     },
     feedbackBullet: {
          color: 'white',
          fontSize: scaleFont(14),
          marginRight: 6,
     },
     feedbackText: {
          color: 'white',
          fontSize: scaleFont(12),
          lineHeight: 20,
          flex: 1,
     },
     row: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 15,
     },
     iconWrapper: {
          padding: 12,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
     },
     icon: {
          width: 40,
          height: 40,
     },
     textWrapper: {
          flex: 1,
          marginLeft: 5,
     },
     label: {
          fontWeight: '700',
          fontSize: scaleFont(22),
     },
     subText: {
          fontSize: scaleFont(12),
          color: colors.mutedText,
          marginTop: 2,
     },
     arrow: {
          width: 20,
          height: 20,
          tintColor: 'white',
     },
     divider: { width: 1, backgroundColor: "rgba(102,102,102,0.2)", alignSelf: "center", height: "60%" },
     button: {
          marginTop: 18,
          height: 50,
          borderRadius: 15,
          backgroundColor: 'linear-gradient(90deg, rgba(0,140,255,1) 0%, rgba(0,200,255,1) 100%)',
          justifyContent: 'center',
          alignItems: 'center',
     },
     buttonText: {
          color: 'white',
          fontWeight: '700',
          fontSize: scaleFont(14),
     }
});