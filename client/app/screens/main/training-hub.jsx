import { StyleSheet, TouchableOpacity, View, } from "react-native";
import { useEffect, useContext, useState } from "react";
import { router } from "expo-router";
import { routes, } from "../../common/settings/constants";
import { colors, nutritionColors } from "../../common/settings/styling";
import AppText from "../../components/screen-comps/app-text";
import { scaleFont } from "../../common/utils/scale-fonts";
import { UserContext } from "../../common/contexts/user-context";
import { Image } from "expo-image";
import { Images } from "../../common/settings/assets";
import { convertEnergy, convertFluid } from "../../common/utils/unit-converter";
import { formatDate } from "../../common/utils/date-time";
import usePopups from "../../common/hooks/use-popups";
import { totalDayConsumption } from "../../common/utils/metrics-calculator";
import APIService from "../../common/services/api-service";
import FloatingActionMenu from "../../components/screen-comps/floating-action-menu";
import ProgressBar from "../../components/screen-comps/progress-bar";
import DateDisplay from "../../components/screen-comps/date-display";
import AppScroll from "../../components/screen-comps/app-scroll";
import Divider from "../../components/screen-comps/divider";

export default function TrainingHub() {
     const { showSpinner, hideSpinner, createToast } = usePopups();
     const { user, setUser } = useContext(UserContext);

     const [consumedEnergy, setConsumedEnergy] = useState(0);
     const [exercises, setExercises] = useState([]);
     const [totalEnergy, setTotalEnergy] = useState(0);
     const [totalExercises, setTotalExercises] = useState(0);

     useEffect(() => {
          async function prepareData() {
               try {
                    showSpinner();

                    const result = await APIService.training.exercises.exercisesByDate(new Date());

                    if (result.success) {
                         const exercises = result.data.exercises;
                         const exercisesTotal = exercises.length;
                         const energyTotal = Math.round(
                              exercises.reduce((total, ex) => {
                                   const totalReps = ex.sets.reduce((sum, set) => sum + set.reps, 0);
                                   const units = totalReps / 5;
                                   const exerciseKCal = (ex.exercise.kCalBurned || 0) * units;
                                   return total + exerciseKCal;
                              }, 0)
                         );

                         setExercises(exercises);
                         setTotalEnergy(energyTotal);
                         setTotalExercises(exercisesTotal);
                    }

                    const date = formatDate(new Date(), { format: "YYYY-MM-DD" });
                    const nutritionLog = user.nutritionLogs[date];
                    const { energyKcal } = totalDayConsumption(nutritionLog);
                    setConsumedEnergy(energyKcal || 0);
               } catch (err) {
                    console.log(err);
               } finally {
                    hideSpinner();
               }
          }

          prepareData();
     }, []);

     function handleMealPlansPress() {
          router.push({
               pathname: routes.MEAL_PLANS,
               params: {
                    mealPlansIntent: 'normal'
               }
          });
     }

     return (
          <>
               <AppScroll extraBottom={150} extraTop={0} hideNavBarOnScroll={true} >
                    <View style={{ margin: 0, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, borderBottomEndRadius: 30, borderBottomStartRadius: 30, backgroundColor: colors.cardBackground }}>
                         <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
                              <AppText style={{ fontSize: scaleFont(15), color: colors.white, fontWeight: 'bold' }}>
                                   Today's Training Summary
                              </AppText>
                              <View style={{ justifyContent: 'center' }}>
                                   <DateDisplay showDay={false} dateStyle={{ fontSize: scaleFont(14) }} uppercaseDate={false} />
                              </View>
                         </View>

                         <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, backgroundColor: colors.backgroundTop, padding: 15, borderRadius: 20 }}>
                              <View style={{ alignItems: 'center', width: '49.8%' }}>
                                   <AppText style={{ fontSize: 14, color: colors.mutedText }}>Burned</AppText>
                                   <AppText style={{ fontSize: 20, fontWeight: '700', color: nutritionColors.energy1 }}>
                                        {convertEnergy(totalEnergy || 0, 'kcal', user.preferences.energyUnit.key)} {user.preferences.energyUnit.field}
                                   </AppText>
                              </View>

                              <Divider style={{ width: '0.4%', backgroundColor: colors.mutedText, borderRadius: 20 }} />

                              <View style={{ alignItems: 'center', width: '49.8%' }}>
                                   <AppText style={{ fontSize: 14, color: colors.mutedText }}>Consumed</AppText>
                                   <AppText style={{ fontSize: 20, fontWeight: '700', color: '#ff4d4d' }}>
                                        {convertEnergy(consumedEnergy, 'kcal', user.preferences.energyUnit.key)} {user.preferences.energyUnit.field}
                                   </AppText>
                              </View>
                         </View>

                         <AppText style={{ fontSize: scaleFont(11), color: colors.mutedText, textAlign: 'center', marginTop: 5 }}>
                              Macro Ratios by Total Daily Energy
                         </AppText>
                    </View>

                    <AppText style={[styles.sectionTitle, { marginHorizontal: 25, fontSize: scaleFont(20), fontWeight: 'bold', marginBottom: 0, marginTop: 25 }]}>Nutrition Tabs</AppText>

                    <TouchableOpacity onPress={() => router.push(routes.WORKOUTS_LOG)} style={[styles.card, { padding: 20 }]}>
                         <View style={{ alignItems: 'center', borderRadius: 15, padding: 20 }}>
                              <Image
                                   source={Images.book5}
                                   style={{ width: 60, height: 60, tintColor: 'white' }}
                              />
                         </View>
                         <View style={{ justifyContent: 'flex-start', paddingBottom: 20 }}>
                              <View style={{ alignItems: 'center' }}>
                                   <AppText style={{ color: 'white', fontSize: scaleFont(20), fontWeight: 'bold' }}>
                                        Meals Diary
                                   </AppText>
                                   <AppText style={{ color: colors.mutedText, fontSize: scaleFont(10) }}>
                                        Track and log all your meals in one place
                                   </AppText>
                              </View>
                         </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleMealPlansPress} style={[styles.card, { padding: 15 }]}>
                         <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
                                   <View style={{ borderRadius: 15, padding: 12, backgroundColor: colors.lightMutedText, overflow: 'hidden' }}>
                                        <Image
                                             source={Images.plan2}
                                             style={{ width: 35, height: 35, tintColor: 'white' }}
                                        />
                                   </View>
                                   <View style={{ justifyContent: 'flex-start', marginStart: 15, marginEnd: 70 }}>
                                        <View>
                                             <AppText style={{ color: 'white', fontSize: scaleFont(18), fontWeight: 'bold' }}>
                                                  Nutrition Plans
                                             </AppText>
                                             <AppText style={{ color: colors.mutedText, fontSize: scaleFont(10) }}>
                                                  Build and prepare your own meals ready for import to your diary
                                             </AppText>
                                        </View>
                                   </View>
                              </View>
                         </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push(routes.FOODS)} style={[styles.card, { padding: 15 }]}>
                         <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
                                   <View style={{ borderRadius: 15, padding: 12, backgroundColor: colors.lightMutedText, overflow: 'hidden' }}>
                                        <Image
                                             source={Images.foodsOne}
                                             style={{ width: 35, height: 35, tintColor: 'white' }}
                                        />
                                   </View>
                                   <View style={{ justifyContent: 'flex-start', marginStart: 15, marginEnd: 70 }}>
                                        <View>
                                             <AppText style={{ color: 'white', fontSize: scaleFont(18), fontWeight: 'bold' }}>
                                                  Personal Foods
                                             </AppText>
                                             <AppText style={{ color: colors.mutedText, fontSize: scaleFont(10) }}>
                                                  Create your own foods and share them with others
                                             </AppText>
                                        </View>
                                   </View>
                              </View>
                         </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push(routes.USDA_PROFILE)} style={[styles.card, { padding: 15 }]}>
                         <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
                                   <View style={{ borderRadius: 15, padding: 12, backgroundColor: colors.lightMutedText, overflow: 'hidden' }}>
                                        <Image
                                             source={Images.usdaLogo}
                                             style={{ width: 35, height: 35, tintColor: 'white' }}
                                             contentFit="contain"
                                        />
                                   </View>
                                   <View style={{ justifyContent: 'flex-start', marginStart: 15, marginEnd: 70 }}>
                                        <View>
                                             <AppText style={{ color: 'white', fontSize: scaleFont(18), fontWeight: 'bold' }}>
                                                  Food Source
                                             </AppText>
                                             <AppText style={{ color: colors.mutedText, fontSize: scaleFont(10) }}>
                                                  Tap for more information about the United States Department of Agriculture, our foods provider
                                             </AppText>
                                        </View>
                                   </View>
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
          padding: 20,
          borderRadius: 20,
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
          borderRadius: 20,
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